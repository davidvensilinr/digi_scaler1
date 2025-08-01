'use client';
import { useState } from 'react';

export default function TestDBPage() {
    const [formData, setFormData] = useState({
        name: '',
        profile_id: '',
        role: 'Creator'
    });
    const [message, setMessage] = useState('');
    const [collections, setCollections] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Adding profile...');
        
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const result = await response.json();
            if (response.ok) {
                setMessage('Profile added successfully!');
                setFormData({ name: '', profile_id: '', role: 'Creator' });
                fetchProfiles();
            } else {
                setMessage(`Error: ${result.error || 'Failed to add profile'}`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const fetchCollections = async () => {
        setMessage('Fetching collections...');
        try {
            const response = await fetch('/api/list-collections');
            const data = await response.json();
            setCollections(data);
            setMessage('Collections fetched successfully');
        } catch (error) {
            setMessage(`Error fetching collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const fetchProfiles = async () => {
        try {
            const response = await fetch('/api/profiles');
            const data = await response.json();
            setProfiles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Test Page</h1>
            
            <div className="mb-8 p-4 border rounded">
                <h2 className="text-xl font-semibold mb-4">1. Check Collections</h2>
                <button 
                    onClick={fetchCollections}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    List All Collections
                </button>
                
                {collections && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Database Information:</h3>
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(collections, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div className="mb-8 p-4 border rounded">
                <h2 className="text-xl font-semibold mb-4">2. Add Test Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Profile ID:</label>
                        <input
                            type="text"
                            name="profile_id"
                            value={formData.profile_id}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Role:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Creator">Creator</option>
                            <option value="Brand">Brand</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add Profile
                    </button>
                </form>
            </div>

            <div className="p-4 border rounded">
                <h2 className="text-xl font-semibold mb-4">3. Current Profiles</h2>
                <button 
                    onClick={fetchProfiles}
                    className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Refresh Profiles
                </button>
                
                {profiles.length > 0 ? (
                    <div className="space-y-2">
                        {profiles.map((profile, index) => (
                            <div key={index} className="p-3 border rounded bg-gray-50">
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>ID:</strong> {profile.profile_id}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No profiles found. Add one using the form above.</p>
                )}
            </div>

            {message && (
                <div className="mt-4 p-3 rounded bg-yellow-100 text-yellow-800">
                    {message}
                </div>
            )}
        </div>
    );
}

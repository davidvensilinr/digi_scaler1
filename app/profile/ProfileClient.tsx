'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProfileClient() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const public_id = searchParams.get('public_id');
    const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME;

    const handleScrape = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/scrape', { method: 'POST' });
            if (res.ok) {
                alert('Scraping complete! Check terminal for output.');
            } else {
                alert('Scraping failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!name || !public_id) {
        return <p className="text-center mt-10 text-red-500">Missing user info</p>;
    }

    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${public_id}.png`;

    return (
        <div className="min-h-screen flex items-start justify-start p-10 bg-black-50">
            <div className="bg-black rounded-lg shadow-md p-6 w-80">
                <img 
                    src={imageUrl}
                    alt={name}
                    className="w-50 h-50 rounded-full object-cover mx-auto mb-4"
                />
                <div className="mt-4">
                    <h1 className="text-white-600 text-sm">Name:</h1>
                    <h1 className="text-white-700 font-medium">{name}</h1>
                </div>
                <div style={{ padding: '2rem' }}>
                    <button 
                        onClick={handleScrape} 
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? 'Scraping...' : 'Start Instagram Scrape'}
                    </button>
                </div>
            </div>
        </div>
    );
}

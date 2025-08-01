'use client';

import { useEffect, useState } from 'react';
import ProfileCard from './ProfileCard';
console.log("👋 ProfileDash component mounted");

type Profile = {
    _id: string;
    name: string;
    profile_id: string;
    role: string;
    
};

export default function ProfileDash() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    console.log("Now?");
    useEffect(() => {
        console.log("🚀 useEffect triggered");
    
        const fetchProfiles = async () => {
            console.log("📡 Starting fetch...");
    
            try {
                const res = await fetch('/api/profiles');
                console.log("🌐 Fetched response:", res);
    
                if (!res.ok) {
                    console.error("❌ Server responded with error status:", res.status);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
    
                const data = await res.json();
                console.log("📦 Profiles fetched:", data);
    
                setProfiles(data);
            } catch (error) {
                console.error("❌ Error during fetchProfiles:", error);
            } finally {
                console.log("✅ Finished fetch attempt");
                setLoading(false);
            }
        };
    
        fetchProfiles();
    }, []);
    

    return (
        <div className="mt-8">
            {loading ? (
                <p className="text-center text-lg">Loading...</p>
            ) : profiles.length === 0 ? (
                <p className="text-center text-lg text-red-500">No profiles found</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {profiles.map((profile, idx) => (
                        <ProfileCard
                            key={profile._id}
                            name={profile.name}
                            public_id={profile.profile_id}
                            role={profile.role}
                            
                            index={idx}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


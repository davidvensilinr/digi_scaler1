'use client'
import {useSearchParams} from 'next/navigation';
import Image from 'next/image';

const cloudName=process.env.NEXT_PUBLIC_CLOUD_NAME;

export default function Profile(){
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const public_id = searchParams.get('public_id');
    if (!name|| !public_id){
        return <p className="text-center mt-10 text-red-500">Missing user info in</p>

    }
    const imageUrl=`https://res.cloudinary.com/${cloudName}/image/upload/${public_id}.png`;

    return (
        <div className="min-h-screen flex items-start justify-start p-10 bg-black-50">
            <div className="bg-black rounded-lg shadow-md p-6 w-80">
            <img 
            src={imageUrl}
            alt={name}
            className="w-50 h-50 rounded-full object-cover mx-auto mb-4"/>
            <div className="mt-4" >
                <h1 className="text-white-600 text-sm">Name:</h1>
                <h1 className="text-white-700 font-medium">{name}</h1>

            </div>
        </div></div>
    )
}
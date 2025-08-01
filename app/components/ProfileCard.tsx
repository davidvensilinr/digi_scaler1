'use client';

import {motion} from 'framer-motion';


type Props={
    name:string;
    role:string;
    public_id:string;
    index:number;
};

const cloudName=process.env.NEXT_PUBLIC_CLOUD_NAME;

export default function ProfileCard({name,role,public_id,index}:Props){
    const imageUrl= `https://res.cloudinary.com/${cloudName}/image/upload/${public_id}.png`;
    
    return(
        <motion.div 
        initial={{opacity:0,y:40}}
        animate={{opacity :1,y:0}}
        transition={{delay:index*0.1}}
        className="bg rounded-xl shadow p-4 text-center"
        >
            <img
            src={imageUrl}
            alt={name}
            className="w-24 h-24 mx-auto rounded-full object-cover mb-4"/>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-sm italic text-gray-500">{role}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Connect</button>

        </motion.div>


    )
}
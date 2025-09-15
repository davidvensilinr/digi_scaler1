'use client'
import React from 'react'
import Link from 'next/link'
import {useState} from 'react'
import {useEffect} from 'react'
export default function Navbar(){
    const [user,setUser]=useState<{_id:string;name:string;profile_id:string}|null>(null);
    const cloudname=process.env.NEXT_PUBLIC_CLOUD_NAME;
    useEffect(()=>{
        const storedUser=localStorage.getItem("user");
        if(storedUser){
            setUser(JSON.parse(storedUser));

        }
    },[]);
    const handleLogout=()=>{
        localStorage.removeItem("user");
        setUser(null);
        window.location.href='/';
    };
    return(
        <header className="w-full h-16 bg-gray shadow flex items-center justify-between px-10">
            <div className="flex items-center space-x-6">
        <h1 className="text-xl font-semibold">Digi Scalers</h1>
        <div>
        <nav className="space-x-20">
            <Link href="/"><button className="text-white-700 hover:text-teal-500 font-medium">Home</button></Link>
            <Link href="/about"><button className="text-white-700 hover:text-teal-500 font-medium">About</button></Link>
            <Link href="/brands"><button className="text-white-700 hover:text-teal-500 font-medium">Brands</button></Link>
            <Link href="/creators"><button className="text-white-700 hover:text-teal-500 font-medium">Creators</button></Link>
            <div className="flex gap-4 items-center">
        {user ? (
          <>
            <img 
              src={user.profile_id ? `https://res.cloudinary.com/${cloudname}/image/upload/${user.profile_id}.png` : `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt={user.name} 
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
            <span>{user.name}</span>
            <button onClick={handleLogout} className="text-red-400">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>




        </nav></div></div></header>
    )
}
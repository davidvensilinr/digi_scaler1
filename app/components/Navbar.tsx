'use client'
import React from 'react'
import Link from 'next/link'
export default function Navbar(){
    return(
        <header className="w-full h-16 bg-gray shadow flex items-center justify-between px-10">
            <div className="flex items-center space-x-6">
        <h1 className="text-xl font-semibold">Digi Scalers</h1>
        <div>
        <nav className="space-x-20">
            <Link href="/"><button className="text-white-700 hover:text-teal-500 font-medium">Home</button></Link>
            <Link href="/about"><button className="text-white-700 hover:text-teal-500 font-medium">About</button></Link>
            <Link href="/brands"><button className="text-white-700 hover:text-teal-500 font-medium">Brands</button></Link>
            <Link href="/Creators"><button className="text-white-700 hover:text-teal-500 font-medium">Creators</button></Link>
            <Link href="/login"><button className="text-white-700 hover:text-teal-500 font-medium">Login/Signup</button></Link>
        



        </nav></div></div></header>
    )
}
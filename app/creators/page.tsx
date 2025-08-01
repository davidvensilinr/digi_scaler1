'use client'
import React from 'react';
import Navbar from "../components/Navbar";
import ProfileDash from "../components/ProfileDash";

export default function Creators(){
    return(
        <div className="min-h-screen bg-balck-100">
            <div><Navbar/></div>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white-800">Connect with Creators!!!</h1>
                </div>
                <main> <div><ProfileDash/></div></main>
            </div>
        </div>
    )
}
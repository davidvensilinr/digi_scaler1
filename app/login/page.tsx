'use client'
import {useState} from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar"
import Link from "next/link"
export default function Login(){
    const[email_id,setEmail_id]=useState("");
    const[password,setPassword]=useState("");
    const router=useRouter();
    const handleLogin=async(e:React.FormEvent)=>{
        e.preventDefault();
        const res= await fetch("/api/login",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email_id,password}),
        });
        const data =await res.json();

        if(!res.ok){
            alert(data.message);
            return;
        }
        // Store user data with both _id and profile_id
        const userData = {
            _id: data._id,
            name: data.name,
            profile_id: data.profile_id || data._id  // Fallback to _id if profile_id is not available
        };
        localStorage.setItem("user", JSON.stringify(userData));
        router.push('/');
    }
    return(
        <div>
            
    <div><Navbar/></div>
    <div className="flex items-center justify-center">
    <h1 className="italic font-medium text-lg text">Login</h1></div>
    <div className="flex items-center justify-center">
    <div className="shadow-lg rounded-lg p-10 w-full max-w-md">
    <form className="space-y-5">
        <div >
        <label className="block text-sm font-medium text-black-600">Email</label>
        <input 
        type="email"
        value={email_id}
        onChange={(e)=>setEmail_id(e.target.value)}
        placeholder="Enter your email"
        className="mt-1 w-full p-3 border border-black-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        /></div>
        <div>
            <label>Password</label>
            <input 
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="Enter you password"
            className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
            type="submit"
            onClick={handleLogin}
             className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-teal-500 font-medium"
            >Login</button>
            <p>Don't have an account? <Link href="/signup" className="text-white-700 hover:text-teal-500 font-medium">Signup</Link></p>
        </div>
    </form></div></div></div>
    )
}
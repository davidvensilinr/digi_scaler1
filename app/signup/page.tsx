import Navbar from "../components/Navbar"
import Link from "next/link"
export default function About(){
    return(
        <div>
            
    <div><Navbar/></div>
    <div className="flex items-center justify-center">
    <h1 className="italic font-medium text-lg text">Signup</h1></div>
    <div className="flex items-center justify-center">
    <div className="shadow-lg rounded-lg p-10 w-full max-w-md">
    <form className="space-y-5">
        <div >
        <label className="block text-sm font-medium text-black-600">Email</label>
        <input 
        type="email"
        placeholder="Enter your email"
        className="mt-1 w-full p-3 border border-black-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        /></div>
        <div>
            <label>Password</label>
            <input 
            type="password"
            placeholder="Confirm you password"
            className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            /></div>
            <div>
            <label>Confirm Password</label>
            <input 
            type="password"
            placeholder="Confirm your password"
            className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            /></div>

            <button
            type="submit"
             className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-teal-500 font-medium"
            >Signup</button>
            <p>Have an account? <Link href="/login" className="text-white-700 hover:text-teal-500 font-medium">Login</Link></p>
        
    </form></div></div></div>
    )
}
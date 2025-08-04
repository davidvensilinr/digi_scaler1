'use client';
import {useState} from "react";
import {useRouter} from "next/navigation";

import Navbar from "../components/Navbar"
import Link from "next/link"
export default function SignupPage(){
    const [name,setName]=useState("");
    const[role,setRole]=useState("Creator");
    const[image,setImage]=useState<File |null>(null);
    const[loading,setLoading]=useState(false);
    const router=useRouter();

    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        console.log("Form submitted");
        if(!name||!image) return alert("Please provide name and image");

        setLoading(true);

        try{
            const formData=new FormData();
            formData.append("file",image);
            formData.append("upload_preset","profiles");

            const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dfzzsjdbp/image/upload",{
                method:"POST",
                body:formData,
            });

            const uploadData=await uploadRes.json();;
            const public_id=uploadData.public_id;

            const res= await fetch("/api/signup",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({name,role,profile_id:public_id}),
            });

            const data = await res.json();
            console.log("Signup Response :",data);
            if(!res.ok) throw new Error("Signup failed");
            console.log("Redirecting...");
            router.push("/brands");

        }catch(err){
            console.error("Signup failed");

        }finally{
            setLoading(false);
        }

    };


  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center mt-10">
        <h1 className="italic font-semibold text-2xl">Signup</h1>
      </div>
      <div className="flex items-center justify-center">
        <div className="shadow-lg rounded-lg p-10 w-full max-w-md ">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
    
                placeholder="Enter your email"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="Creator">Creator</option>
                <option value="Brand">Brand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
            >
              {loading ? "Creating Account..." : "Signup"}
            </button>

            <p className="text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
import { NextResponse }  from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/profile";
import { profile } from "console";
export async function POST(req: Request){
    try{
        const{name,profile_id,role,password}=await req.json();

        if(!name||!profile_id||!role||!password){
            console.log("name",name,"profile",profile_id,"role",role,"password",password);
            return NextResponse.json({error:"Missing Fields"},{status:400});
        }
        await connectDB();

        const newUser=new User({name,profile_id,role,password});
        await newUser.save();

        return NextResponse.json({messgae:"User created successfully"},{status:201});


    }catch(error){
        console.error("Signup error: ",error);
        return NextResponse.json({error:"Failed to create user"},{status:500});
    }
}

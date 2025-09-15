import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import User from "@/lib/models/profile";

export async function POST(req: Request) {
    try {
        const { email_id, password } = await req.json();
        
        if (!email_id || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        await connectDB();
        
        const user = await User.findOne({ email_id ,password});
        
        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // TODO: Add password verification logic here
        // For example: const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) { return invalid credentials }

        return NextResponse.json({
            _id: user._id,
            name: user.name,
            profile_id: user.profile_id || user._id,  // Fallback to _id if profile_id doesn't exist
            email: user.email
        });

    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
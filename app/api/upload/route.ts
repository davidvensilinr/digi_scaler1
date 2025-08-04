import {NextResponse} from 'next/server';
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.cloud_name!,
    api_key:process.env.cloud_api!,
    api_secret:process.env.cloud_key!,
});

export async function POST(req:Request){
    try{
        const data= await req.formData();
        const file=data.get("file") as File;

        if(!file){
            return NextResponse.json({error : "No file uploaded"},{status:400});
        }

        const arrayBuffer=await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject)=>{
            cloudinary.uploader.upload_stream({folder:"profiles"},(err,result)=>{
            if (err) reject (err);
            else resolve(result);
            }).end(buffer);
        });
        return NextResponse.json(result);

    }catch(err){
        console.error("Upload error:",err);
        return NextResponse.json({error:"Upload Failed"},{status:500});
    }
}
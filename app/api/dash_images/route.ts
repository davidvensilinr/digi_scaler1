import {v2 as cloudinary} from 'cloudinary'
import {NextResponse} from 'next/server'
cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.cloud_api,
    api_secret:process.env.cloud_key
})
export async function GET(){
    try{
        const result = await cloudinary.search
        .expression('folder:dash')
        .sort_by('created_at','desc')
        .max_results(10)
        .execute()
        const images = result.resources.map((img:any)=>({
            url:img.secure_url,
            public_id:img.public_id,
        }))
        return NextResponse.json(images)
    }
    catch(error){
        return NextResponse.json([], { status:500 })
    }
}

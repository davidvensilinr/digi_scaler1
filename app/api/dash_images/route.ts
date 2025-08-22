import {v2 as cloudinary} from 'cloudinary'
import {NextResponse} from 'next/server'

console.log('[DEBUG] Initializing Cloudinary configuration...')
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_api,
    api_secret: process.env.cloud_key
})
console.log('[DEBUG] Cloudinary config initialized with:', {
    cloud_name: process.env.cloud_name ? '***' : 'MISSING',
    api_key: process.env.cloud_api ? '***' : 'MISSING',
    api_secret: process.env.cloud_key ? '***' : 'MISSING'
})

export async function GET(){
    console.log('[DEBUG] GET /api/dash_images endpoint called')
    try {
        console.log('[DEBUG] Starting Cloudinary search...')
        const searchQuery = cloudinary.search
            .expression('folder:dash')
            .sort_by('created_at', 'desc')
            .max_results(10)
        
        console.log('[DEBUG] Executing Cloudinary search with query:', {
            expression: 'folder:dash',
            sort: 'created_at desc',
            max_results: 10
        })
        
        const result = await searchQuery.execute()
        console.log('[DEBUG] Cloudinary search completed. Results count:', result.resources?.length || 0)
        
        if (!result.resources) {
            console.error('[ERROR] No resources found in Cloudinary response')
            return NextResponse.json([], { status: 200 })
        }

        const images = result.resources.map((img: any, index: number) => {
            console.log(`[DEBUG] Processing image ${index + 1}:`, {
                public_id: img.public_id,
                secure_url: img.secure_url ? '***' : 'MISSING',
                format: img.format,
                bytes: img.bytes,
                created_at: img.created_at
            })
            return {
                url: img.secure_url,
                public_id: img.public_id,
            }
        })
        
        console.log('[DEBUG] Returning', images.length, 'processed images')
        return NextResponse.json(images)
    }
    catch (error: any) {
        console.error('[ERROR] Error in GET /api/dash_images:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        })
        return NextResponse.json(
            { error: 'Failed to fetch images', details: error.message },
            { status: 500 }
        )
    }
}
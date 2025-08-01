'use client'

import {useEffect,useState} from 'react'
import {motion} from 'framer-motion'

type Image={
    url:string
    public_id:string
}
export default function DashImages(){
    const [images,setImages]=useState<Image[]>([])


useEffect(()=>{
    const fetchImages = async()=>{
        const res=await fetch('api/dash_images')
        const data = await res.json()
        setImages(data)
    }
    fetchImages()
},[])
return(
    <div className = "mt-8">
        {images.length===0?(
            <p className="text-xl font-semibold">Loading...</p>
        ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((img,idx)=>(
                    <motion.div
                    key={img.public_id}
                    initial={{opacity:0,y:30}}
                    animate={{opacity: 1,y:0}}
                    transition={{duration:0.6,delay:idx*0.1}}
                    className="rounded shadow overflow-hidden bg-white"
                    >
                        <img src={img.url} alt={'Image ${idx}'} className="w-full object-cover"/>
                    </motion.div>

                ))}
                </div>
        )}
    </div>
)

}
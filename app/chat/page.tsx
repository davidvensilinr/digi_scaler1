'use client'
import {useSearchParams} from 'next/navigation';
import Navbar from '../components/Navbar';

export default function ChatPage(){
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const public_id=searchParams.get('public_id');

    const cloudName=process.env.NEXT_PUBLIC_CLOUD_NAME;
    const imageUrl=`https://res.cloudinary.com/${cloudName}/image/upload/${public_id}.png`;
    return(
        <div >
            <div><Navbar/></div>
        <div className="flex items-center gap-4 px-6 py-4 border-b sticky top-0 z-10">
            <img src={imageUrl} alt={name!} className="w-12 h-12 rounded-full object-cover"/>
            <h2 className="text-xl font-semibold">{name}</h2>
        </div>
        <div className="flex flex-col h-screen">
        {/*Box*/}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Sample messages */}
        <div className="max-w-xs bg-teal-500 p-3 rounded-xl self-start">Hello there!</div>
        <div className="max-w-xs bg-blue-500 p-3 rounded-xl self-end ml-auto">Hey! How can I help?</div>
        {/* You can map messages here */}
      </div>
      {/* Chat Input */}
      <div className="sticky bottom-0 w-full border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
            Send
          </button>
        </div>
      </div></div>
        </div>
    )


}
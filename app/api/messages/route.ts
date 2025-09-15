import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message, { IMessage } from "@/lib/models/Message";
import User from "@/lib/models/profile";
import { Types } from "mongoose";

async function validateProfileId(profileId: string): Promise<boolean> {
  try {
    if (!profileId) {
      console.log('No profileId provided');
      return false;
    }
    const trimmedId = profileId.trim();
    console.log('Looking up profile_id:', trimmedId);
    const user = await User.findOne({ profile_id: trimmedId });
    console.log('User found:', !!user);
    return !!user;
  } catch (error) {
    console.error('Error in validateProfileId:', error);
    return false;
  }
}

export async function GET(req: Request) {
  console.log('GET /api/messages called');
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('DB connected');
    
    const { searchParams } = new URL(req.url);
    const currentUserProfileId = searchParams.get("profile_id");
    const otherUserProfileId = searchParams.get("chatWith");
    
    console.log('Request params:', { currentUserProfileId, otherUserProfileId });

    if (!currentUserProfileId || !otherUserProfileId) {
      return NextResponse.json(
        { error: "Both profile_id and chatWith parameters are required" },
        { status: 400 }
      );
    }

    // Validate that both profiles exist
    const [currentUserExists, otherUserExists] = await Promise.all([
      validateProfileId(currentUserProfileId),
      validateProfileId(otherUserProfileId)
    ]);

    if (!currentUserExists || !otherUserExists) {
      return NextResponse.json(
        { error: "One or both users not found" },
        { status: 404 }
      );
    }

    const query = {
      $or: [
        { 
          senderId: currentUserProfileId.trim(),
          receiverId: otherUserProfileId.trim()
        },
        { 
          senderId: otherUserProfileId.trim(),
          receiverId: currentUserProfileId.trim()
        }
      ]
    };
    
    console.log('Querying messages with:', JSON.stringify(query, null, 2));
    
    const messages = await Message.find(query)
      .sort({ timestamp: 1 })
      .lean()
      .catch(err => {
        console.error('Error querying messages:', err);
        throw err;
      });
      
    console.log(`Found ${messages.length} messages`);

    // Mark messages as read when fetched by receiver
    await Message.updateMany(
      {
        senderId: otherUserProfileId.trim(),
        receiverId: currentUserProfileId.trim(),
        read: false
      },
      { $set: { read: true } }
    );

    return NextResponse.json(messages);
    
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { senderId, receiverId, text } = body;

    // Input validation
    if (!senderId || !receiverId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields (senderId, receiverId, or text)' },
        { status: 400 }
      );
    }

    // Validate text length
    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message text cannot be empty' },
        { status: 400 }
      );
    }

    // Validate profile IDs exist
    const [senderExists, receiverExists] = await Promise.all([
      validateProfileId(senderId),
      validateProfileId(receiverId)
    ]);

    if (!senderExists || !receiverExists) {
      return NextResponse.json(
        { error: 'Invalid sender or receiver profile_id' },
        { status: 404 }
      );
    }

    // Create and save the message
    const newMessage = new Message({
      senderId: senderId.trim(),
      receiverId: receiverId.trim(),
      text: text.trim(),
      timestamp: new Date(),
      read: false
    });

    const savedMessage = await newMessage.save();
    
    return NextResponse.json({
      message: 'Message sent successfully',
      data: {
        id: savedMessage._id,
        senderId: savedMessage.senderId,
        receiverId: savedMessage.receiverId,
        text: savedMessage.text,
        timestamp: savedMessage.timestamp,
        read: savedMessage.read
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

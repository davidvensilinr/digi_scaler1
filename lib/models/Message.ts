import mongoose, {Schema,Document} from "mongoose";

export interface IMessage extends Document {
    senderId: string;     // profile_id of the sender
    receiverId: string;   // profile_id of the receiver
    text: string;
    timestamp: Date;
    read: boolean;
}

const MessageSchema = new Schema<IMessage>({
    senderId: { 
        type: String, 
        required: [true, 'Sender profile_id is required'],
        trim: true
    },
    receiverId: { 
        type: String, 
        required: [true, 'Receiver profile_id is required'],
        trim: true
    },
    text: { 
        type: String, 
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [2000, 'Message cannot be longer than 2000 characters']
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster querying
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });
MessageSchema.index({ receiverId: 1, read: 1 });

// Pre-save hook to ensure profile IDs are properly formatted
MessageSchema.pre('save', function(next) {
    this.senderId = this.senderId.trim();
    this.receiverId = this.receiverId.trim();
    next();
});

export default mongoose.models?.Message || mongoose.model<IMessage>("Message", MessageSchema);

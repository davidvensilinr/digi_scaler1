export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string; // ISO string format
  read: boolean;
}

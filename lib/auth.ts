import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./mongodb";
import { MongoClient } from 'mongodb';
import User from "./models/profile";

// Initialize MongoDB client
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        
        // Fetch additional user data from your database
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          session.user.profile_id = dbUser.profile_id;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Check if user exists in your database
      const existingUser = await User.findOne({ email: user.email });
      
      if (!existingUser && user.email) {
        // Create new user in your database if they don't exist
        await User.create({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }
      
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile_id?: string;
    };
  }
}

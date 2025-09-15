import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile_id?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile_id?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    profile_id?: string;
  }
}

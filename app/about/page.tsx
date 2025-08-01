'use client';

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center px-6 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Empowering <span className="text-blue-600">Creators</span>, Fueling <span className="text-blue-600">Brands</span>, Maximizing <span className="text-blue-600">Earnings</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 font-medium">
            This is the platform where you scale your business, elevate your influence, and unlock new revenue streams — all in one powerful ecosystem.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

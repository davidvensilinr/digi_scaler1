import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          It seems you're not connected to the internet. Some features may not be available.
        </p>
        <Link 
          href="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry Connection
        </Link>
      </div>
    </div>
  );
}

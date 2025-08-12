import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-400">Codegram</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <Link href="/login" className="hover:text-blue-400 transition">Login</Link>
            <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-4 space-y-2">
          <Link href="/" className="block hover:text-blue-400">Home</Link>
          <Link href="/login" className="block hover:text-blue-400">Login</Link>
          <Link href="/signup" className="block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
      
    <img 
  src="/IMG-20250812-WA0043.jpg" 
  alt="Codegram Logo" 
  className="h-10 w-10 object-cover rounded-full border-2 border-[#00FF9F]"
/>
  );
}

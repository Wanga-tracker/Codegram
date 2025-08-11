// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-400">&lt;/&gt;</span> Codegram
        </Link>

        {/* Nav Buttons */}
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          🚀 Codegram
        </h1>
        <p className="mt-4 text-lg md:text-2xl max-w-2xl">
          Discover, deploy, and level-up your bots. Built for developers,
          powered by the community.
        </p>

        <div className="mt-8">
          <Link
            href="/signup"
            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-white/70 text-sm">
        &copy; {new Date().getFullYear()} Codegram. All rights reserved.
      </footer>
    </div>
  );
}

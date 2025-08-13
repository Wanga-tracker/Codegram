// pages/index.js (User Dashboard)
import { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bots = [
    { id: 1, name: "WhatsApp Bot", desc: "Automates chats", color: "green" },
    { id: 2, name: "Code Linter", desc: "Improves your code quality", color: "purple" },
    { id: 3, name: "AI Content Bot", desc: "Writes creative content", color: "cyan" }
  ];

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
          <Menu size={28} className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-neon-green text-center flex-1">CODEGRAM</h1>
        <Link href="/notifications">
          <Bell size={24} className="cursor-pointer hover:shadow-neon-cyan" />
        </Link>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-gray-900 p-4 transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <nav className="space-y-4 mt-10">
          <Link href="/profile" className="block hover:shadow-neon-green">Profile</Link>
          <Link href="/api" className="block hover:shadow-neon-purple">API</Link>
          <Link href="/bots" className="block hover:shadow-neon-cyan">Bots</Link>
          <Link href="/panels" className="block hover:shadow-neon-pink">Panels</Link>
          <Link href="/web" className="block hover:shadow-neon-yellow">Web</Link>
          <Link href="/support" className="block hover:shadow-neon-green">Support</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-56">
        {/* Section Titles */}
        <div className="flex justify-around mb-6">
          <h2 className="text-xl font-semibold text-neon-green">Bots</h2>
          <h2 className="text-xl font-semibold text-neon-purple">News</h2>
          <h2 className="text-xl font-semibold text-neon-cyan">Latest</h2>
        </div>

        {/* Bots List */}
        <div className="space-y-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className={`p-4 rounded-lg bg-gray-800 hover:shadow-neon-${bot.color} transition-all duration-300`}
            >
              <h3 className={`text-lg font-bold text-neon-${bot.color}`}>{bot.name}</h3>
              <p className="text-gray-400">{bot.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-800 text-gray-500">
        Tracker Wanga © {new Date().getFullYear()}
      </footer>
    </div>
  );
        }

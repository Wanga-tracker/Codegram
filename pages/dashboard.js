// pages/admin/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabaseClient.js"; // make sure this exists

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [bots, setBots] = useState([]);

  const sections = [
    { key: "profile", label: "Profile", href: "/admin/profile" },
    { key: "notifications", label: "Notifications", href: "/admin/notifications" },
    { key: "news", label: "News", href: "/admin/news" },
    { key: "bots", label: "Bots", href: "/admin/bots" },
    { key: "promotions", label: "Promotions", href: "/admin/promotions" },
  ];

  useEffect(() => {
    // Fetch recent Notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) console.error("Error fetching notifications:", error);
      else setNotifications(data || []);
    };

    // Fetch recent News
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) console.error("Error fetching news:", error);
      else setNews(data || []);
    };

    // Fetch recent Bots
    const fetchBots = async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) console.error("Error fetching bots:", error);
      else setBots(data || []);
    };

    fetchNotifications();
    fetchNews();
    fetchBots();
  }, []);

  const handleRedirect = (href) => {
    if (href) router.push(href);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full bg-gray-900 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 md:translate-x-0 md:static md:flex md:flex-col`}
      >
        <div className="flex items-center justify-between p-6 mb-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/IMG-20250813-WA0001.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-[#00FFFF]"
            />
            <span className="font-bold text-[#00FFFF] text-lg">CODEGRAM</span>
          </div>
          <button
            className="text-gray-400 hover:text-[#00FFFF] md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="px-4 space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.key}
              onClick={() => handleRedirect(sec.href)}
              className="cursor-pointer hover:text-[#00FFFF] font-medium py-2 px-2 rounded transition-colors"
            >
              {sec.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300">
        {/* Mobile Hamburger */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="text-[#00FFFF]"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-[#00FFFF] text-xl">CODEGRAM</span>
        </div>

        {/* </> code redirect button */}
        <div
          className="mb-4 cursor-pointer text-[#9D00FF] font-bold text-xl hover:text-[#00FFFF] transition-colors"
          onClick={() => router.push("/admin/code")}
        >
          &lt;/&gt;
        </div>

        {/* Hero / Welcome */}
        <div className="flex items-center justify-between bg-gray-900 p-6 rounded-2xl mb-6 shadow-[0_0_20px_#00FFFF]/20">
          <div>
            <h1 className="text-3xl font-bold text-[#00FFFF]">
              Welcome back, Tracker Wanga 👋
            </h1>
            <p className="text-gray-400">Here’s what’s happening today</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gray-800 rounded-xl shadow-[0_0_10px_#9D00FF]/40">
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-[#00FFFF] font-bold text-xl">124</p>
            </div>
            <Image
              src="/IMG-20250813-WA0001.jpg"
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full border-2 border-[#00FFFF]"
            />
          </div>
        </div>

        {/* Recent Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:scale-105 transition-transform shadow-[0_0_20px_#00FFFF]/20"
            >
              <h3 className="text-[#9D00FF] font-bold">Notification</h3>
              <p className="text-gray-300 mt-1">{n.title}</p>
            </div>
          ))}

          {/* News */}
          {news.map((n) => (
            <div
              key={n.id}
              className="p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:scale-105 transition-transform shadow-[0_0_20px_#00FFFF]/20"
            >
              <h3 className="text-[#9D00FF] font-bold">News</h3>
              <p className="text-gray-300 mt-1">{n.title}</p>
            </div>
          ))}

          {/* Bots */}
          {bots.map((b) => (
            <div
              key={b.bot_id}
              className="p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:scale-105 transition-transform shadow-[0_0_20px_#00FFFF]/20"
            >
              <h3 className="text-[#9D00FF] font-bold">Bot</h3>
              <p className="text-gray-300 mt-1">{b.name}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          © 2025 Codegram — Tracker Wanga
        </footer>
      </main>
    </div>
  );
  }

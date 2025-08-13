// pages/admin/dashboard.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Bars3Icon } from "@heroicons/react/24/solid";

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true); // sidebar initially hidden for Android
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [bots, setBots] = useState([]);
  const router = useRouter();

  const sections = [
    { key: "dashboard", label: "Dashboard" },
    { key: "profile", label: "Profile", href: "/admin/profile" },
    { key: "notifications", label: "Notifications", href: "/admin/notifications" },
    { key: "news", label: "News", href: "/admin/news" },
    { key: "bots", label: "Bots", href: "/admin/bots" },
    { key: "promotions", label: "Promotions", href: "/admin/promotions" },
  ];

  // Fetch recent posts
  const fetchRecent = async () => {
    const { data: notifData } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setNotifications(notifData || []);

    const { data: newsData } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setNews(newsData || []);

    const { data: botsData } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setBots(botsData || []);
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleRedirect = (href) => {
    if (href) router.push(href);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 z-50 transition-transform duration-300 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } w-64`}
      >
        <div className="flex items-center justify-between p-6 mb-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/IMG-20250812-WA0043.jpg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-full border-2 border-[#00FFFF]"
            />
            <span className="font-bold text-[#00FFFF] text-lg">CODEGRAM</span>
          </div>
          <button
            className="text-gray-400 hover:text-[#00FFFF]"
            onClick={() => setCollapsed(true)}
          >
            ✕
          </button>
        </div>

        <nav className="space-y-3 px-4">
          {sections.map((sec) => (
            <div
              key={sec.key}
              onClick={() => handleRedirect(sec.href)}
              className="cursor-pointer hover:text-[#00FFFF] font-medium py-2 rounded"
            >
              {sec.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-0">
        {/* Mobile Hamburger */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="text-[#00FFFF]"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-[#00FFFF] text-xl">CODEGRAM</span>
        </div>

        {/* </> redirect button */}
        <div
          className="mb-4 cursor-pointer text-[#9D00FF] font-bold text-xl hover:text-[#00FFFF]"
          onClick={() => router.push("/admin/code")}
        >
          &lt;/&gt;
        </div>

        <h1 className="text-3xl font-bold text-[#00FFFF] mb-6">Admin Dashboard</h1>

        {/* Recent Notifications */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#9D00FF] mb-3">
            Recent Notifications
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 bg-gray-800 rounded border border-gray-700 mb-2"
              >
                <h3 className="font-bold">{n.title}</h3>
                <p className="text-gray-300">{n.message}</p>
                <small className="text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>

        {/* Recent News */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#9D00FF] mb-3">
            Recent News
          </h2>
          {news.length === 0 ? (
            <p className="text-gray-400">No news yet.</p>
          ) : (
            news.map((n) => (
              <div
                key={n.id}
                className="p-4 bg-gray-800 rounded border border-gray-700 mb-2"
              >
                <h3 className="font-bold">{n.title}</h3>
                <p className="text-gray-300">{n.content}</p>
                <small className="text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>

        {/* Recent Bots */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#9D00FF] mb-3">
            Recent Bots
          </h2>
          {bots.length === 0 ? (
            <p className="text-gray-400">No bots yet.</p>
          ) : (
            bots.map((b) => (
              <div
                key={b.bot_id}
                className="p-4 bg-gray-800 rounded border border-gray-700 mb-2"
              >
                <h3 className="font-bold">{b.name}</h3>
                <p className="text-gray-300">{b.description}</p>
                <small className="text-gray-500">
                  {new Date(b.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
    }

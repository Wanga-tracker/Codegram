// pages/admin/dashboard.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [bots, setBots] = useState([]);

  const sections = [
    { key: "dashboard", label: "Dashboard" },
    { key: "profile", label: "Profile" },
    { key: "notifications", label: "Notifications" },
    { key: "news", label: "News" },
    { key: "bots", label: "Bots" },
    { key: "promotions", label: "Promotions" },
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

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside
        className={`bg-gray-900 p-6 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Image
                src="/IMG-20250812-WA0043.jpg"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full border-2 border-[#00FF9F]"
              />
              <span className="font-bold text-[#00FF9F] text-lg">Codegram</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-[#00FF9F]"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        <nav className="space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`cursor-pointer hover:text-[#00FF9F] ${
                activeSection === sec.key ? "font-bold text-[#00FF9F]" : ""
              }`}
            >
              {collapsed ? sec.label.charAt(0) : sec.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold text-[#00FF9F] mb-6">
              Admin Dashboard
            </h1>

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
          </>
        )}

        {/* Other Sections Placeholders */}
        {activeSection === "profile" && <h1>Profile Section Coming Soon</h1>}
        {activeSection === "notifications" && (
          <h1>Notifications Section Coming Soon (full page)</h1>
        )}
        {activeSection === "news" && <h1>News Section Coming Soon</h1>}
        {activeSection === "bots" && <h1>Bots Section Coming Soon</h1>}
        {activeSection === "promotions" && <h1>Promotions Section Coming Soon</h1>}
      </main>
    </div>
  );
}

// pages/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon, Bell } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bots");
  const [bots, setBots] = useState([]);
  const [panels, setPanels] = useState([]);
  const [latest, setLatest] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchBots = async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setBots(data || []);
    };

    const fetchPanels = async () => {
      const { data, error } = await supabase
        .from("panels")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPanels(data || []);
    };

    const fetchLatest = async () => {
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      setLatest([
        ...(notificationsData || []),
        ...(newsData || [])
      ]);
    };

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setNotifications(data || []);
    };

    fetchBots();
    fetchPanels();
    fetchLatest();
    fetchNotifications();
  }, []);

  const tabs = [
    { key: "bots", label: "Bots" },
    { key: "panels", label: "Panels" },
    { key: "latest", label: "Latest" },
  ];

  const sidebarLinks = [
    { label: "Profile", href: "/profile", color: "green" },
    { label: "API", href: "/api", color: "purple" },
    { label: "Bots", href: "/bots", color: "cyan" },
    { label: "Panels", href: "/panels", color: "pink" },
    { label: "Web", href: "/web", color: "yellow" },
    { label: "Support", href: "/support", color: "green" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 p-6 transform transition-transform duration-500 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neon-green">CODEGRAM</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="space-y-4">
          {sidebarLinks.map((link) => (
            <div
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`cursor-pointer hover:shadow-neon-${link.color} font-medium py-2 px-2 rounded transition-all`}
            >
              {link.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
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

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-2xl mb-6 shadow-[0_0_20px_#00FFFF]/20 animate-fadeIn">
          <div className="flex justify-between w-full items-center mb-4">
            <button
              onClick={() => router.push("/code")}
              className="text-neon-purple font-bold text-xl hover:shadow-neon-purple transition-all"
            >
              &lt;/&gt;
            </button>
            <Bell
              className="w-6 h-6 cursor-pointer text-neon-cyan hover:shadow-neon-cyan transition-all"
              onClick={() => router.push("/notifications")}
            />
          </div>
          <h1 className="text-3xl font-bold text-neon-green mb-2 animate-fadeInUp">
            Welcome back, Tracker Wanga 👋
          </h1>
          <Image
            src="/IMG-20250813-WA0001.jpg"
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border-2 border-neon-green mt-4 animate-pulse"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-around mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-semibold rounded-lg transition-all
              ${activeTab === tab.key ? "bg-neon-green text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "bots" &&
            (bots.length ? (
              bots.map((b) => (
                <div
                  key={b.bot_id}
                  className="p-4 rounded-lg bg-gray-800 hover:shadow-neon-green transition-all"
                >
                  <h3 className="font-bold text-neon-green">{b.name}</h3>
                  <p className="text-gray-400">{b.description}</p>
                  <p className="text-gray-500 text-sm">{b.status || "offline"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nothing is up yet</p>
            ))}

          {activeTab === "panels" &&
            (panels.length ? (
              panels.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg bg-gray-800 hover:shadow-neon-pink transition-all"
                >
                  <h3 className="font-bold text-neon-pink">{p.title || "Untitled"}</h3>
                  <p className="text-gray-400">{p.description || ""}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nothing is up yet</p>
            ))}

          {activeTab === "latest" &&
            (latest.length ? (
              latest.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-lg bg-gray-800 hover:shadow-neon-cyan transition-all"
                >
                  <h3 className="font-bold text-neon-cyan">{l.title || l.name}</h3>
                  <p className="text-gray-400">{l.content || l.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nothing is up yet</p>
            ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          Tracker Wanga © {new Date().getFullYear()}
        </footer>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
      `}</style>
    </div>
  );
  }

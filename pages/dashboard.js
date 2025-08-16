// pages/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { BellIcon, PlusCircleIcon, CpuChipIcon } from "@heroicons/react/24/outline"; 
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bots");
  const [bots, setBots] = useState([]);

  // Fetch user’s own bots only
  useEffect(() => {
    const fetchBots = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (!error) setBots(data || []);
    };

    fetchBots();
  }, []);

  const tabs = [{ key: "bots", label: "Bots", icon: CpuChipIcon }];

  const sidebarLinks = [
    { label: "Bots", href: "/dashboard", icon: CpuChipIcon, color: "cyan" },
    { label: "Post", href: "/post", icon: PlusCircleIcon, color: "green" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-gray-900 p-6 transform transition-transform duration-500 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold text-neon-green">CODEGRAM</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="space-y-4">
          {sidebarLinks.map((link) => (
            <div
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`flex items-center gap-3 cursor-pointer hover:shadow-neon-${link.color} py-2 px-3 rounded-lg transition-all`}
            >
              <link.icon className="w-6 h-6 text-neon-green" />
              <span className="font-medium">{link.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-6">
        {/* Mobile Hamburger */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button className="text-neon-cyan" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-neon-green text-xl">CODEGRAM</span>
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
            <BellIcon
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
        <div className="flex justify-center mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2 font-semibold rounded-lg transition-all
              ${activeTab === tab.key ? "bg-neon-green text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            >
              <tab.icon className="w-5 h-5" />
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
              <p className="text-gray-400 text-center">🚀 Nothing here yet. Start by posting your first bot!</p>
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

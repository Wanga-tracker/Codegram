// pages/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bots");
  const [bots, setBots] = useState([]);
  const [panels, setPanels] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: botsData } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: panelsData } = await supabase
        .from("panels")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      setBots(botsData || []);
      setPanels(panelsData || []);
      setLatest(newsData || []);
    };
    fetchData();
  }, []);

  const tabs = [
    { key: "bots", label: "Bots" },
    { key: "panels", label: "Panels" },
    { key: "latest", label: "Latest" },
  ];

  const sidebarLinks = [
    { label: "Profile", href: "/profile" },
    { label: "API", href: "/api" },
    { label: "Bots", href: "/bots" },
    { label: "Panels", href: "/panels" },
    { label: "Web", href: "/web" },
    { label: "Support", href: "/support" },
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg text-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border p-6 transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-brand-green">CODEGRAM</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="space-y-3">
          {sidebarLinks.map((link) => (
            <div
              key={link.href}
              onClick={() => router.push(link.href)}
              className="cursor-pointer px-3 py-2 rounded-md hover:bg-brand-green hover:text-black transition"
            >
              {link.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="text-brand-green"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-brand-green text-lg">CODEGRAM</span>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center bg-dark-card p-6 rounded-xl mb-6 shadow-glow">
          <div className="flex justify-between w-full mb-4">
            <button
              onClick={() => router.push("/code")}
              className="text-brand-purple font-bold text-xl hover:opacity-80"
            >
              &lt;/&gt;
            </button>
            <BellIcon
              className="w-6 h-6 cursor-pointer text-brand-blue hover:text-brand-green transition"
              onClick={() => router.push("/notifications")}
            />
          </div>
          <h1 className="text-2xl font-bold text-brand-green mb-2">
            Welcome back, Tracker Wanga 👋
          </h1>
          <Image
            src="/IMG-20250813-WA0001.jpg"
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border border-brand-green mt-3"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
                ${activeTab === tab.key
                  ? "bg-brand-green text-black"
                  : "bg-dark-card text-gray-300 hover:bg-dark-border"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid gap-4">
          {activeTab === "bots" &&
            (bots.length ? (
              bots.map((b) => (
                <div
                  key={b.bot_id}
                  className="p-4 rounded-lg bg-dark-card border border-dark-border hover:border-brand-green transition"
                >
                  <h3 className="font-bold text-brand-green">{b.name}</h3>
                  <p className="text-gray-400">{b.description}</p>
                  <p className="text-xs text-gray-500">{b.status || "offline"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No bots available</p>
            ))}

          {activeTab === "panels" &&
            (panels.length ? (
              panels.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg bg-dark-card border border-dark-border hover:border-brand-purple transition"
                >
                  <h3 className="font-bold text-brand-purple">{p.title}</h3>
                  <p className="text-gray-400">{p.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No panels available</p>
            ))}

          {activeTab === "latest" &&
            (latest.length ? (
              latest.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-lg bg-dark-card border border-dark-border hover:border-brand-blue transition"
                >
                  <h3 className="font-bold text-brand-blue">{l.title}</h3>
                  <p className="text-gray-400">{l.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No updates yet</p>
            ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          Tracker Wanga © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
    }

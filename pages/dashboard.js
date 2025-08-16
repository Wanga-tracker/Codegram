// pages/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { BellIcon, PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bots");
  const [bots, setBots] = useState([]);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchBots = async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setBots(data || []);
    };

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        setUsername(profile?.username || user.email);
      } else {
        setUsername(null);
      }
    };

    fetchBots();
    fetchUser();
  }, []);

  const tabs = [
    { key: "bots", label: "Bots" },
    { key: "post", label: "Post" },
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-dark-card p-6 transform transition-transform duration-500 ease-in-out z-50 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-brand-green tracking-wide">
            CODEGRAM
          </h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="space-y-4">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() =>
                tab.key === "post"
                  ? router.push("/post")
                  : setActiveTab(tab.key)
              }
              className={`cursor-pointer px-4 py-2 rounded-lg font-semibold tracking-wide transition-all duration-300
              ${
                activeTab === tab.key
                  ? "bg-brand-green text-black shadow-glow"
                  : "bg-dark-border text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.key === "post" ? (
                <span className="flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" /> {tab.label}
                </span>
              ) : (
                tab.label
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-6">
        {/* Mobile Hamburger */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="text-brand-blue"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-brand-green text-xl">CODEGRAM</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center bg-dark-card p-6 rounded-2xl mb-6 shadow-glow animate-fadeIn">
          <div className="flex justify-between w-full items-center mb-4">
            <button
              onClick={() => router.push("/code")}
              className="text-brand-purple font-bold text-xl hover:scale-110 transition-transform"
            >
              &lt;/&gt;
            </button>
            <BellIcon
              className="w-6 h-6 cursor-pointer text-brand-blue hover:scale-110 transition-transform"
              onClick={() => router.push("/notifications")}
            />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-green mb-2 animate-fadeInUp">
            Welcome back, {username ? username : "Guest"} 👋
          </h1>
          <Image
            src="/IMG-20250813-WA0001.jpg"
            alt="Profile"
            width={90}
            height={90}
            className="rounded-full border-2 border-brand-green mt-4 animate-pulse"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "bots" &&
            (bots.length ? (
              bots.map((b) => (
                <div
                  key={b.bot_id}
                  className="p-6 rounded-xl bg-dark-card shadow-md hover:shadow-glow transition-all duration-500 transform hover:scale-[1.02] animate-fadeIn"
                >
                  <h3 className="text-2xl font-bold text-brand-green tracking-wide">
                    {b.name}
                  </h3>
                  <p className="text-gray-400 mt-2">{b.description}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {b.status || "offline"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nothing is up yet</p>
            ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          CODEGRAM © {new Date().getFullYear()}
        </footer>
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
  }

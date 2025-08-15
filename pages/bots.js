// pages/bots.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

export default function BotsPage() {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setBots(data);
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-center text-4xl font-extrabold mb-10">
        <span className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
          WhatsApp Bots
        </span>
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <div
            key={bot.bot_id}
            className="rounded-2xl border border-green-500/30 bg-gradient-to-b from-black to-green-900/10 p-6 shadow-lg hover:shadow-green-500/40 hover:border-green-400 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
          >
            {/* Bot Name */}
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              {bot.name}
            </h2>

            {/* Developer Name */}
            <p className="text-sm text-blue-300 mb-4">by {bot.developer_name}</p>

            {/* Hosting Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {bot.deployment_hosts?.map((host, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs border border-green-400/30"
                >
                  {host}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4">
              <button className="flex items-center gap-1 text-green-400 hover:text-green-300">
                <ThumbsUp size={18} /> {bot.likes || 0}
              </button>
              <button className="flex items-center gap-1 text-red-400 hover:text-red-300">
                <ThumbsDown size={18} /> {bot.dislikes || 0}
              </button>
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                <MessageSquare size={18} /> Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

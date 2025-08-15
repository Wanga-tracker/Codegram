import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/router";

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const router = useRouter();

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

  async function handleVote(botId, type) {
    const storageKey = `vote-${botId}`;
    if (localStorage.getItem(storageKey)) return alert("You already voted!");

    const bot = bots.find((b) => b.bot_id === botId);
    const newCount = (bot[type] || 0) + 1;

    const { error } = await supabase
      .from("bots")
      .update({ [type]: newCount })
      .eq("bot_id", botId);

    if (!error) {
      setBots((prev) =>
        prev.map((b) =>
          b.bot_id === botId ? { ...b, [type]: newCount } : b
        )
      );
      localStorage.setItem(storageKey, "true");
    }
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
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              {bot.name}
            </h2>
            <p className="text-sm text-blue-300 mb-4">
              by {bot.developer_name}
            </p>

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

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => handleVote(bot.bot_id, "likes")}
                className="flex items-center gap-1 text-green-400 hover:text-green-300"
              >
                <ThumbsUp size={18} /> {bot.likes || 0}
              </button>

              <button
                onClick={() => handleVote(bot.bot_id, "dislikes")}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <ThumbsDown size={18} /> {bot.dislikes || 0}
              </button>

              <button
                onClick={() => router.push(`/bot/${bot.name.replace(/\s+/g, "-")}`)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <MessageSquare size={18} /> Comment
              </button>
            </div>

            <button
              onClick={() => router.push(`/bot/${bot.name.replace(/\s+/g, "-")}`)}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-green-400 text-green-300 py-2 hover:bg-green-500/10 transition"
            >
              See More <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

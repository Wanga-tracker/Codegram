import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/router";

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const [commentText, setCommentText] = useState({});
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
    let existingVote = localStorage.getItem(storageKey);

    const bot = bots.find((b) => b.bot_id === botId);
    let newLikes = bot.likes || 0;
    let newDislikes = bot.dislikes || 0;

    if (existingVote === type) {
      if (type === "likes") newLikes--;
      if (type === "dislikes") newDislikes--;
      localStorage.removeItem(storageKey);
    } else {
      if (type === "likes") {
        newLikes++;
        if (existingVote === "dislikes") newDislikes--;
      }
      if (type === "dislikes") {
        newDislikes++;
        if (existingVote === "likes") newLikes--;
      }
      localStorage.setItem(storageKey, type);
    }

    const { error } = await supabase
      .from("bots")
      .update({ likes: newLikes, dislikes: newDislikes })
      .eq("bot_id", botId);

    if (!error) {
      setBots((prev) =>
        prev.map((b) =>
          b.bot_id === botId
            ? { ...b, likes: newLikes, dislikes: newDislikes }
            : b
        )
      );
    }
  }

  async function handleComment(botId) {
    const bot = bots.find((b) => b.bot_id === botId);
    const newComments = [...(bot.comments || []), commentText[botId]];

    const { error } = await supabase
      .from("bots")
      .update({ comments: newComments })
      .eq("bot_id", botId);

    if (!error) {
      setBots((prev) =>
        prev.map((b) =>
          b.bot_id === botId ? { ...b, comments: newComments } : b
        )
      );
      setCommentText((prev) => ({ ...prev, [botId]: "" }));
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-300 border-green-400/40";
      case "offline":
        return "bg-red-500/20 text-red-300 border-red-400/40";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/40";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow px-6 py-12">
        <h1 className="text-center text-4xl font-extrabold mb-10">
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            WhatsApp Bots
          </span>
        </h1>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => {
            const userVote = localStorage.getItem(`vote-${bot.bot_id}`);
            return (
              <div
                key={bot.bot_id}
                className="rounded-2xl border border-green-500/30 bg-gradient-to-b from-black to-green-900/10 p-6 shadow-lg hover:shadow-green-500/40 hover:border-green-400 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
              >
                {/* Bot Name + Status */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-green-400">
                    {bot.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                      bot.status
                    )}`}
                  >
                    {bot.status || "unknown"}
                  </span>
                </div>

                <p className="text-sm text-blue-300 mb-4">
                  by {bot.developer_name}
                </p>

                {/* Hosting tags */}
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

                {/* Voting */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleVote(bot.bot_id, "likes")}
                    className={`flex items-center gap-1 ${
                      userVote === "likes"
                        ? "text-green-300"
                        : "text-green-500 hover:text-green-300"
                    }`}
                  >
                    <ThumbsUp size={18} /> {bot.likes || 0}
                  </button>

                  <button
                    onClick={() => handleVote(bot.bot_id, "dislikes")}
                    className={`flex items-center gap-1 ${
                      userVote === "dislikes"
                        ? "text-red-300"
                        : "text-red-500 hover:text-red-300"
                    }`}
                  >
                    <ThumbsDown size={18} /> {bot.dislikes || 0}
                  </button>
                </div>

                {/* Comment Input */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText[bot.bot_id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [bot.bot_id]: e.target.value,
                      }))
                    }
                    className="w-full p-2 rounded bg-gray-900 border border-green-500/30 text-white"
                  />
                  <button
                    onClick={() => handleComment(bot.bot_id)}
                    className="mt-2 bg-green-500/20 px-4 py-1 rounded hover:bg-green-500/30 border border-green-400 text-green-300"
                  >
                    Comment
                  </button>
                </div>

                {/* Latest Comment */}
                {bot.comments && bot.comments.length > 0 && (
                  <div className="mt-4 bg-gray-900/60 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-green-300">
                      Latest Comment:
                    </h3>
                    <p className="text-xs text-gray-300">
                      {bot.comments[bot.comments.length - 1]}
                    </p>
                  </div>
                )}

                {/* See More */}
                <button
                  onClick={() =>
                    router.push(`/bots/${bot.name.replace(/\s+/g, "-")}`)
                  }
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-green-400 text-green-300 py-2 hover:bg-green-500/10 transition"
                >
                  See More <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-green-500/20 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Codegram — All rights reserved.
      </footer>
    </div>
  );
}

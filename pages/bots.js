import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    const { data, error } = await supabase.from("bots").select("*");
    if (!error) setBots(data);
  }

  async function handleVote(botId, type) {
    const bot = bots.find((b) => b.bot_id === botId);
    const newCount = (bot?.[type] || 0) + 1;

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

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bots.map((bot) => (
        <div
          key={bot.bot_id}
          className="bg-gray-900 text-white rounded-2xl shadow-lg p-5 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-2">{bot.name}</h2>
          <p className="text-sm text-gray-400">{bot.description}</p>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => handleVote(bot.bot_id, "likes")}
              className="bg-green-500 px-3 py-1 rounded-lg hover:bg-green-600"
            >
              👍 {bot.likes || 0}
            </button>
            <button
              onClick={() => handleVote(bot.bot_id, "dislikes")}
              className="bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600"
            >
              👎 {bot.dislikes || 0}
            </button>
          </div>

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
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
            />
            <button
              onClick={() => handleComment(bot.bot_id)}
              className="mt-2 bg-blue-500 px-4 py-1 rounded hover:bg-blue-600"
            >
              Comment
            </button>
          </div>

          {bot.comments && bot.comments.length > 0 && (
            <div className="mt-4 bg-gray-800 p-3 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Comments:</h3>
              {bot.comments.map((c, i) => (
                <p key={i} className="text-xs text-gray-300">
                  {c}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
            }

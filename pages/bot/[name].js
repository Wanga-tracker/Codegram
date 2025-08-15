// pages/bots/[name].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function BotDetails() {
  const router = useRouter();
  const { name } = router.query;

  const [bot, setBot] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  useEffect(() => {
    if (name) {
      fetchData(name);

      // Realtime updates
      const channel = supabase
        .channel("bot_interactions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bot_interactions" },
          () => fetchInteractions()
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [name]);

  async function fetchData(botName) {
    setLoading(true);

    // Bot details
    const { data: botData } = await supabase
      .from("bots")
      .select("*")
      .eq("name", botName)
      .single();

    if (!botData) {
      setLoading(false);
      return;
    }
    setBot(botData);

    // Developer details
    const { data: devData } = await supabase
      .from("developers")
      .select("*")
      .eq("bot_name", botName)
      .maybeSingle();
    setDeveloper(devData);

    // Interactions
    fetchInteractions(botData.bot_id);
    setLoading(false);
  }

  async function fetchInteractions(botId = bot?.bot_id) {
    if (!botId) return;
    const { data } = await supabase
      .from("bot_interactions")
      .select("*")
      .eq("bot_id", botId);
    setInteractions(data || []);
  }

  async function handleLike(isLike) {
    if (!user) return alert("Login to interact");
    await supabase.from("bot_interactions").upsert(
      {
        bot_id: bot.bot_id,
        user_id: user.id,
        like: isLike,
        dislike: !isLike
      },
      { onConflict: "bot_id,user_id" }
    );
  }

  async function handleComment() {
    if (!user) return alert("Login to comment");
    if (!newComment.trim()) return;
    await supabase.from("bot_interactions").insert({
      bot_id: bot.bot_id,
      user_id: user.id,
      comment: newComment.trim()
    });
    setNewComment("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-400">
        Loading bot details...
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Bot not found!
      </div>
    );
  }

  const likesCount = interactions.filter(i => i.like).length;
  const dislikesCount = interactions.filter(i => i.dislike).length;
  const comments = interactions.filter(i => i.comment);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* BOT INFO */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-green-500 shadow-[0_0_15px_#00ff7f]">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🤖 Bot Info</h2>
          <p><strong>Name:</strong> {bot.name}</p>
          <p><strong>Developer:</strong> {bot.developer_name}</p>
          <p><strong>Status:</strong> {bot.status}</p>
          <p><strong>Description:</strong> {bot.description}</p>
        </div>

        {/* DEVELOPER INFO */}
        {developer && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500 shadow-[0_0_15px_#00cfff]">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">👨‍💻 Developer Info</h2>
            <p><strong>Name:</strong> {developer.developer_name}</p>
            <p>{developer.developer_description}</p>
          </div>
        )}

        {/* INTERACTIONS */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-pink-500 shadow-[0_0_15px_#ff00ff]">
          <h2 className="text-2xl font-bold text-pink-400 mb-4">💡 Interactions</h2>
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => handleLike(true)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                interactions.some(i => i.like && i.user_id === user?.id)
                  ? "bg-green-500 text-black shadow-[0_0_10px_#00ff7f]"
                  : "bg-gray-700 text-white hover:bg-green-400"
              }`}
            >
              👍 {likesCount}
            </button>
            <button
              onClick={() => handleLike(false)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                interactions.some(i => i.dislike && i.user_id === user?.id)
                  ? "bg-red-500 text-black shadow-[0_0_10px_#ff4d4d]"
                  : "bg-gray-700 text-white hover:bg-red-400"
              }`}
            >
              👎 {dislikesCount}
            </button>
          </div>

          {/* COMMENTS */}
          <div>
            <h3 className="text-lg font-bold mb-3">💬 Comments</h3>
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c, i) => (
                  <p key={i} className="bg-gray-800 p-3 rounded-lg">
                    <span className="text-green-400 font-semibold">{c.user_id}</span>: {c.comment}
                  </p>
                ))}
              </div>
            ) : (
              <p>No comments yet.</p>
            )}
            {user && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-black border border-green-400 p-2 rounded-lg text-white"
                />
                <button
                  onClick={handleComment}
                  className="bg-green-500 text-black px-4 rounded-lg font-bold hover:bg-green-400"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// pages/bots/[name].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function BotDetails() {
  const router = useRouter();
  const { name } = router.query;

  const [bot, setBot] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      fetchData(name);
    }
  }, [name]);

  async function fetchData(botName) {
    setLoading(true);

    // Fetch bot details
    const { data: botData, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("name", botName)
      .single();

    if (botError) {
      console.error(botError);
      setLoading(false);
      return;
    }
    setBot(botData);

    // Fetch developer details if exists
    const { data: devData } = await supabase
      .from("developers")
      .select("*")
      .eq("bot_name", botName)
      .maybeSingle();

    setDeveloper(devData);

    // Fetch interactions (likes, dislikes, comments)
    const { data: interactionsData } = await supabase
      .from("bot_interactions")
      .select("*")
      .eq("bot_id", botData.bot_id);

    setInteractions(interactionsData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
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
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-green-500">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🤖 Bot Info</h2>
          <p><strong>Name:</strong> {bot.name}</p>
          <p><strong>Developer:</strong> {bot.developer_name}</p>
          <p><strong>Status:</strong> {bot.status}</p>
          <p><strong>Version:</strong> {bot.version || "N/A"}</p>
          <p><strong>Description:</strong> {bot.description}</p>
        </div>

        {/* DEVELOPER INFO */}
        {developer && (
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-blue-500">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">👨‍💻 Developer Info</h2>
            <p><strong>Name:</strong> {developer.developer_name}</p>
            <p>{developer.developer_description}</p>
            <div className="mt-4 space-y-2">
              {developer.github_link && (
                <a href={developer.github_link} target="_blank" className="text-green-400 underline">GitHub</a>
              )}
              {developer.developer_site && (
                <a href={developer.developer_site} target="_blank" className="block text-green-400 underline">Website</a>
              )}
              {developer.whatsapp_channel && (
                <a href={developer.whatsapp_channel} target="_blank" className="block text-green-400 underline">WhatsApp Channel</a>
              )}
              {developer.whatsapp_group && (
                <a href={developer.whatsapp_group} target="_blank" className="block text-green-400 underline">WhatsApp Group</a>
              )}
              {developer.whatsapp_number && (
                <p className="block text-green-400">📞 {developer.whatsapp_number}</p>
              )}
            </div>
          </div>
        )}

        {/* BOT URLS */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-purple-500">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">🔗 Bot Links</h2>
          {bot.github_url && <a href={bot.github_url} target="_blank" className="text-green-400 underline block">GitHub</a>}
          {bot.developer_site && <a href={bot.developer_site} target="_blank" className="text-green-400 underline block">Website</a>}
        </div>

        {/* DOWNLOADS */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">📥 Downloads</h2>
          {bot.zip_file_url ? (
            <a href={bot.zip_file_url} download className="bg-green-500 px-4 py-2 rounded-lg text-black font-bold">Download ZIP</a>
          ) : (
            <p>No downloads available</p>
          )}
        </div>

        {/* INTERACTIONS */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-red-500">
          <h2 className="text-2xl font-bold text-red-400 mb-4">❤️ Interactions</h2>
          <p>👍 Likes: {likesCount}</p>
          <p>👎 Dislikes: {dislikesCount}</p>
          <div className="mt-4">
            <h3 className="text-lg font-bold">💬 Comments</h3>
            {comments.length > 0 ? (
              comments.map((c, i) => (
                <p key={i} className="border-b border-gray-700 py-2">{c.comment}</p>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Globe,
  Download,
  Link,
} from "lucide-react";

export default function BotDetails() {
  const router = useRouter();
  const { name } = router.query;

  const [bot, setBot] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  // Fetch bot + developer info
  useEffect(() => {
    if (!name) return;
    fetchBotData();
  }, [name]);

  async function fetchBotData() {
    const { data: botData } = await supabase
      .from("bots")
      .select("*")
      .eq("name", name)
      .single();

    setBot(botData);

    const { data: devData } = await supabase
      .from("developers")
      .select("*")
      .eq("bot_name", name)
      .single();

    setDeveloper(devData);
  }

  // Live update for bot row
  useEffect(() => {
    if (!name) return;
    const channel = supabase
      .channel(`bot-updates-${name}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bots", filter: `name=eq.${name}` },
        (payload) => {
          setBot(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [name]);

  async function handleVote(type) {
    if (!bot) return;

    const storageKey = `vote-${bot.bot_id}`;
    let existingVote = localStorage.getItem(storageKey);

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

    await supabase
      .from("bots")
      .update({ likes: newLikes, dislikes: newDislikes })
      .eq("bot_id", bot.bot_id);
  }

  async function handleComment() {
    if (!bot) return;
    const username = user?.user_metadata?.username || "Anonymous";

    const newComment = `${username}: ${commentText}`;
    const newComments = [...(bot.comments || []), newComment];

    await supabase
      .from("bots")
      .update({ comments: newComments })
      .eq("bot_id", bot.bot_id);

    setCommentText("");
  }

  if (!bot) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-green-400 mb-6">{bot.name}</h1>

      {/* BOT INFO */}
      <div className="mb-6 p-4 border border-green-500/30 rounded-xl bg-green-900/10">
        <h2 className="text-xl font-bold text-green-300 mb-2">Bot Info</h2>
        <p>{bot.description}</p>
        <p className="mt-2">
          Status:{" "}
          <span
            className={`font-bold ${
              bot.status === "online" ? "text-green-400" : "text-red-400"
            }`}
          >
            {bot.status}
          </span>
        </p>
      </div>

      {/* DEVELOPER INFO */}
      {developer && (
        <div className="mb-6 p-4 border border-blue-500/30 rounded-xl bg-blue-900/10">
          <h2 className="text-xl font-bold text-blue-300 mb-2">
            Developer Info
          </h2>
          <p className="font-bold">{developer.developer_name}</p>
          <p>{developer.developer_description}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {developer.github_link && (
              <a
                href={developer.github_link}
                className="text-green-400 hover:underline flex items-center gap-1"
              >
                <Globe size={14} /> GitHub
              </a>
            )}
            {developer.developer_site && (
              <a
                href={developer.developer_site}
                className="text-green-400 hover:underline flex items-center gap-1"
              >
                <Link size={14} /> Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* BOT URLS */}
      <div className="mb-6 p-4 border border-purple-500/30 rounded-xl bg-purple-900/10">
        <h2 className="text-xl font-bold text-purple-300 mb-2">Bot URLs</h2>
        {bot.github_url && (
          <a href={bot.github_url} className="block text-green-400 hover:underline">
            GitHub Repo
          </a>
        )}
        {bot.developer_site && (
          <a href={bot.developer_site} className="block text-green-400 hover:underline">
            Website
          </a>
        )}
      </div>

      {/* DOWNLOADS */}
      <div className="mb-6 p-4 border border-yellow-500/30 rounded-xl bg-yellow-900/10">
        <h2 className="text-xl font-bold text-yellow-300 mb-2">Downloads</h2>
        {bot.zip_file_url && (
          <a
            href={bot.zip_file_url}
            className="inline-flex items-center gap-1 bg-green-500/20 border border-green-400 px-3 py-1 rounded hover:bg-green-500/30"
          >
            <Download size={14} /> Download Bot
          </a>
        )}
      </div>

      {/* COMMENTS */}
      <div className="mb-6 p-4 border border-pink-500/30 rounded-xl bg-pink-900/10">
        <h2 className="text-xl font-bold text-pink-300 mb-2 flex items-center gap-1">
          <MessageSquare size={16} /> Comments
        </h2>
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 rounded bg-gray-900 border border-green-500/30 text-white"
          />
          <button
            onClick={handleComment}
            className="bg-green-500/20 px-4 py-1 rounded hover:bg-green-500/30 border border-green-400 text-green-300"
          >
            Send
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {bot.comments?.map((c, i) => (
            <p
              key={i}
              className="text-sm border-b border-green-500/20 pb-1 text-gray-300"
            >
              {c}
            </p>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 text-center text-xs text-gray-500 border-t border-green-500/20 pt-4">
        Codegram © {new Date().getFullYear()} - All rights reserved.
      </footer>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Bot, User, Link as LinkIcon, Download, Heart, ThumbsDown, MessageSquare, Github, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function BotDetails() {
  const router = useRouter();
  const { name } = router.query;

  const [bot, setBot] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) fetchData(name);
  }, [name]);

  async function fetchData(botName) {
    setLoading(true);

    const { data: botData } = await supabase
      .from("bots")
      .select("*")
      .eq("name", botName)
      .single();
    setBot(botData);

    const { data: devData } = await supabase
      .from("developers")
      .select("*")
      .eq("bot_name", botName)
      .maybeSingle();
    setDeveloper(devData);

    const { data: interactionsData } = await supabase
      .from("bot_interactions")
      .select("*")
      .eq("bot_id", botData.bot_id);
    setInteractions(interactionsData || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-brand-green">Loading...</div>;
  }

  if (!bot) {
    return <div className="h-screen flex items-center justify-center text-red-500">Bot not found!</div>;
  }

  const likes = interactions.filter(i => i.like).length;
  const dislikes = interactions.filter(i => i.dislike).length;
  const comments = interactions.filter(i => i.comment);

  return (
    <div className="min-h-screen bg-dark-bg text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Bot /> {bot.name}
          </h1>
          <span className={`px-3 py-1 text-sm rounded-full ${
            bot.status === "online" ? "bg-green-500/20 text-green-400" : 
            bot.status === "offline" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
          }`}>
            {bot.status}
          </span>
          <p className="text-gray-400">{bot.description}</p>
        </motion.div>

        {/* DEVELOPER CARD */}
        {developer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-card p-6 rounded-2xl shadow-glow border border-dark-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-brand-blue">
              <User /> Developer
            </h2>
            <p className="mt-2">{developer.developer_description}</p>
            <div className="mt-4 flex gap-4">
              {developer.github_link && <a href={developer.github_link} target="_blank"><Github className="text-white hover:text-brand-green" /></a>}
              {developer.developer_site && <a href={developer.developer_site} target="_blank"><Globe className="text-white hover:text-brand-green" /></a>}
            </div>
          </motion.div>
        )}

        {/* DOWNLOADS */}
        <motion.div whileHover={{ scale: 1.02 }} className="bg-dark-card p-6 rounded-2xl shadow-lg border border-dark-border text-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-yellow">
            <Download /> Download
          </h2>
          {bot.zip_file_url ? (
            <a href={bot.zip_file_url} download className="mt-4 inline-block bg-brand-green px-5 py-3 rounded-lg text-black font-bold shadow-glow">
              Download ZIP
            </a>
          ) : <p className="text-gray-500">No downloads available</p>}
        </motion.div>

        {/* INTERACTIONS */}
        <motion.div className="bg-dark-card p-6 rounded-2xl shadow-lg border border-dark-border">
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-red">
            <Heart /> Interactions
          </h2>
          <div className="flex gap-6 mt-4">
            <span className="flex items-center gap-2 text-green-400"><Heart /> {likes}</span>
            <span className="flex items-center gap-2 text-red-400"><ThumbsDown /> {dislikes}</span>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold flex items-center gap-2"><MessageSquare /> Comments</h3>
            <div className="mt-2 space-y-2">
              {comments.length ? comments.map((c, i) => (
                <p key={i} className="bg-dark-bg p-3 rounded-lg border border-dark-border">{c.comment}</p>
              )) : <p className="text-gray-500">No comments yet.</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
        }

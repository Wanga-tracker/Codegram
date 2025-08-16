// pages/admin/bots.js
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Pencil,
  Trash2,
  User,
  Cpu,
  Github,
  Globe,
  FileArchive,
  Image as ImageIcon,
  Info,
  Cloud,
  Upload,
  Power,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBots() {
  const [form, setForm] = useState({
    name: "",
    developer_name: "",
    version: "",
    description: "",
    image_url: "",
    zip_file_url: "",
    github_url: "",
    developer_site: "",
    posted_by: "",
    status: "offline",
    deployment_hosts: [],
  });

  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [user, setUser] = useState(null);

  const hostingOptions = useMemo(
    () => ["Heroku", "Render", "Replit", "Railway", "Vercel", "Katabump", "Own hosting"],
    []
  );

  // -------- Auth check + fetch bots --------
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        toast.error("Auth check failed");
      } else {
        setUser(data.user || null);
        if (data.user) {
          setForm((prev) => ({ ...prev, posted_by: data.user.email }));
        }
      }
    };
    getUser();
    fetchBots();
  }, []);

  const fetchBots = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .eq("posted_by", user.email) // 🔒 only show own bots
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load bots");
      return;
    }
    setBots(data || []);
  };

  // -------- Form handlers --------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleHost = (host) => {
    setForm((prev) => {
      const arr = Array.isArray(prev.deployment_hosts) ? prev.deployment_hosts : [];
      return arr.includes(host)
        ? { ...prev, deployment_hosts: arr.filter((h) => h !== host) }
        : { ...prev, deployment_hosts: [...arr, host] };
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      developer_name: "",
      version: "",
      description: "",
      image_url: "",
      zip_file_url: "",
      github_url: "",
      developer_site: "",
      posted_by: user?.email || "",
      status: "offline",
      deployment_hosts: [],
    });
    setEditingBot(null);
  };

  // -------- Save (insert/update) --------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return toast.error("You must be signed in to post");
    if (!form.name?.trim()) return toast.error("Bot name is required");

    setLoading(true);
    try {
      const payload = { ...form, posted_by: user.email };

      if (editingBot?.bot_id) {
        if (editingBot.posted_by !== user.email) {
          toast.error("You can only edit your own bots");
        } else {
          const { error } = await supabase.from("bots").update(payload).eq("bot_id", editingBot.bot_id);
          if (error) throw error;
          toast.success("Bot updated");
        }
      } else {
        const { error } = await supabase.from("bots").insert([payload]);
        if (error) throw error;
        toast.success("Bot posted");
      }

      resetForm();
      fetchBots();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // -------- Edit / Delete --------
  const startEdit = (bot) => {
    setEditingBot(bot);
    setForm(bot);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (bot_id) => setConfirmDeleteId(bot_id);
  const cancelDelete = () => setConfirmDeleteId(null);

  const doDelete = async (bot) => {
    if (bot.posted_by !== user?.email) {
      toast.error("You can only delete your own bots");
      return;
    }
    try {
      const { error } = await supabase.from("bots").delete().eq("bot_id", bot.bot_id);
      if (error) throw error;
      toast.success("Bot deleted");
      setConfirmDeleteId(null);
      fetchBots();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  // -------- Input with Icon --------
  const InputWithIcon = ({ icon: Icon, ...props }) => (
    <div className="flex items-center bg-gray-800 rounded-lg border border-green-500/20 px-3">
      <Icon size={18} className="text-green-400 mr-2" />
      <input
        {...props}
        className="w-full p-3 bg-transparent outline-none text-white placeholder-gray-400"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white p-6">
      <Toaster position="top-right" />
      <motion.h1
        className="text-4xl font-extrabold mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow">
          {editingBot ? "Edit Bot" : "Post New Bot"}
        </span>
      </motion.h1>

      {!user ? (
        <p className="text-center text-red-400">⚠️ Please sign in to post a bot.</p>
      ) : (
        // FORM
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-green-500/20 rounded-2xl shadow-xl max-w-5xl mx-auto p-6 space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <InputWithIcon icon={Cpu} type="text" name="name" placeholder="Bot Name" value={form.name} onChange={handleChange} required />
          <InputWithIcon icon={User} type="text" name="developer_name" placeholder="Developer Name" value={form.developer_name} onChange={handleChange} />
          <InputWithIcon icon={Info} type="text" name="version" placeholder="Version" value={form.version} onChange={handleChange} />
          <textarea
            name="description"
            placeholder="Short description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
          />

          <InputWithIcon icon={Github} type="url" name="github_url" placeholder="GitHub URL" value={form.github_url} onChange={handleChange} />
          <InputWithIcon icon={Globe} type="url" name="developer_site" placeholder="Developer Website" value={form.developer_site} onChange={handleChange} />
          <InputWithIcon icon={FileArchive} type="url" name="zip_file_url" placeholder="Direct ZIP Download Link" value={form.zip_file_url} onChange={handleChange} />
          <InputWithIcon icon={ImageIcon} type="url" name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-3">
            {hostingOptions.map((host) => (
              <label key={host} className="flex items-center gap-2 bg-gray-800/60 border border-yellow-500/20 rounded-lg px-3 py-2 hover:border-yellow-400 transition">
                <input
                  type="checkbox"
                  checked={(form.deployment_hosts || []).includes(host)}
                  onChange={() => toggleHost(host)}
                  className="accent-yellow-400"
                />
                <Cloud size={16} className="text-yellow-400" />
                <span>{host}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {loading ? "Saving…" : editingBot ? "Update Bot" : "Post Bot"}
            </button>
            {editingBot && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>
      )}

      {/* BOT CARDS */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Your Bots</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {bots.map((bot) => (
            <motion.div
              key={bot.bot_id}
              className="bg-gray-800/60 border border-green-500/20 rounded-xl p-5 shadow-lg hover:shadow-green-500/20 transition"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="text-green-400" size={20} />
                {bot.name}
              </h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                <User size={14} /> {bot.developer_name || "Unknown"}
              </p>
              <p className="text-sm mt-2 line-clamp-3">{bot.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Power
                  size={16}
                  className={
                    bot.status === "online"
                      ? "text-green-400"
                      : bot.status === "maintenance"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }
                />
                <span className="capitalize text-xs">{bot.status}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => startEdit(bot)}
                  className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                >
                  <Pencil size={16} /> Edit
                </button>

                {confirmDeleteId === bot.bot_id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => doDelete(bot)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => confirmDelete(bot.bot_id)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-black rounded-lg hover:bg-red-400"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="max-w-5xl mx-auto text-center text-xs text-gray-400 mt-10">
        ⚡ Codegram Bot Management © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

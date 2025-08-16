// pages/admin/bots.js
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react"; // icons

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
      }
    };
    getUser();
    fetchBots();
  }, []);

  const fetchBots = async () => {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
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
      posted_by: "",
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
      // check duplicate bot name
      const { data: existing } = await supabase
        .from("bots")
        .select("bot_id")
        .eq("name", form.name.trim())
        .maybeSingle();

      if (!editingBot && existing) {
        toast.error("Sorry, bot already exists");
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name?.trim(),
        developer_name: form.developer_name || null,
        version: form.version || null,
        description: form.description || null,
        image_url: form.image_url || null,
        zip_file_url: form.zip_file_url || null,
        github_url: form.github_url || null,
        developer_site: form.developer_site || null,
        posted_by: user.email, // always bind to logged in user
        status: form.status || "offline",
        deployment_hosts: Array.isArray(form.deployment_hosts) ? form.deployment_hosts : [],
      };

      if (editingBot?.bot_id) {
        // restrict edit to own bots
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
    setForm({
      name: bot.name || "",
      developer_name: bot.developer_name || "",
      version: bot.version || "",
      description: bot.description || "",
      image_url: bot.image_url || "",
      zip_file_url: bot.zip_file_url || "",
      github_url: bot.github_url || "",
      developer_site: bot.developer_site || "",
      posted_by: bot.posted_by || "",
      status: bot.status || "offline",
      deployment_hosts: Array.isArray(bot.deployment_hosts) ? bot.deployment_hosts : [],
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white p-6">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-extrabold mb-8 text-center">
        <span className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow">
          {editingBot ? "Edit Bot" : "Post New Bot"}
        </span>
      </h1>

      {!user ? (
        <p className="text-center text-red-400">⚠️ Please sign in to post a bot.</p>
      ) : (
        // FORM
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-green-500/20 rounded-2xl shadow-xl max-w-5xl mx-auto p-6 space-y-8"
        >
          {/* BOT INFO */}
          <section>
            <h2 className="text-xl font-bold text-green-400 mb-4">BOT INFO</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Bot Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              <input
                type="text"
                name="developer_name"
                placeholder="Developer Name"
                value={form.developer_name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              <input
                type="text"
                name="version"
                placeholder="Version"
                value={form.version}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <input
                type="text"
                name="posted_by"
                placeholder="Posted By"
                value={form.posted_by}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none md:col-span-2"
              />
            </div>

            <textarea
              name="description"
              placeholder="Short description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-4 w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
            />

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <input
                type="url"
                name="github_url"
                placeholder="GitHub URL"
                value={form.github_url}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              <input
                type="url"
                name="developer_site"
                placeholder="Developer Website"
                value={form.developer_site}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              <input
                type="url"
                name="zip_file_url"
                placeholder="Direct ZIP Download Link"
                value={form.zip_file_url}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none md:col-span-2"
              />
              <input
                type="url"
                name="image_url"
                placeholder="Image URL (e.g., Imgur, Cloudinary)"
                value={form.image_url}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none md:col-span-2"
              />
            </div>
          </section>

          {/* DEPLOYMENT HOSTS */}
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">DEPLOYMENT HOSTS</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {hostingOptions.map((host) => (
                <label
                  key={host}
                  className="flex items-center gap-2 bg-gray-800/60 border border-yellow-500/20 rounded-lg px-3 py-2 hover:border-yellow-400 transition"
                >
                  <input
                    type="checkbox"
                    name="deployment_hosts"
                    value={host}
                    checked={(form.deployment_hosts || []).includes(host)}
                    onChange={() => toggleHost(host)}
                    className="accent-yellow-400"
                  />
                  <span className="text-sm">{host}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition disabled:opacity-60"
            >
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
        </form>
      )}

      {/* ALL BOTS */}
      <h2 className="text-2xl font-bold mt-10 mb-4">All Bots</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-green-500/20 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-800/70">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Developer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.bot_id} className="border-t border-green-500/10">
                <td className="p-3">{bot.name}</td>
                <td className="p-3">{bot.developer_name}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-md text-xs border ${
                      bot.status === "online"
                        ? "bg-green-500/15 text-green-300 border-green-400/40"
                        : bot.status === "maintenance"
                        ? "bg-yellow-500/15 text-yellow-300 border-yellow-400/40"
                        : "bg-red-500/10 text-red-300 border-red-400/40"
                    }`}
                  >
                    {bot.status}
                  </span>
                </td>
                <td className="p-3 flex items-center gap-2">
                  {user && bot.posted_by === user.email && (
                    <>
                      <button
                        onClick={() => startEdit(bot)}
                        className="px-3 py-1.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 flex items-center gap-1"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      {confirmDeleteId === bot.bot_id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => doDelete(bot)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmDelete(bot.bot_id)}
                          className="px-3 py-1.5 bg-red-500 text-black rounded-lg hover:bg-red-400 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {bots.length === 0 && (
              <tr>
                <td className="p-4 text-sm text-gray-400" colSpan={4}>
                  No bots yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="max-w-5xl mx-auto text-center text-xs text-gray-400 mt-10">
        ⚡ Codegram Bot Management © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

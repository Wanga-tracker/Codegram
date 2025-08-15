// pages/admin/bots.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBots() {
  const [form, setForm] = useState({
    // BOT FIELDS (must exist in bots table)
    name: "",
    developer_name: "",
    version: "",
    description: "",
    github_url: "",
    zip_file_url: "", // direct link only
    developer_site: "",
    posted_by: "",
    status: "offline",
    deployment_hosts: [],
    image_url: "",

    // DEVELOPER PROFILE (stored in developers table)
    developer_description: "",
    github_link: "",
    whatsapp_channel: "",
    whatsapp_group: "",
    whatsapp_number: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bots, setBots] = useState([]);
  const [editingBot, setEditingBot] = useState(null);

  const hostingOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own hosting",
  ];

  // --- Load bots ---
  useEffect(() => {
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

  // --- Form change ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "deployment_hosts") {
      setForm((prev) => ({
        ...prev,
        deployment_hosts: checked
          ? [...prev.deployment_hosts, value]
          : prev.deployment_hosts.filter((h) => h !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Upload image to Supabase Storage (bucket: bots) ---
  const uploadImage = async (file) => {
    if (!file) return null;
    const filePath = `images/${Date.now()}_${file.name}`; // ✅ fixed backticks
    const { error } = await supabase.storage.from("bots").upload(filePath, file, {
      upsert: false,
    });
    if (error) throw error;
    const { data: publicData } = supabase.storage.from("bots").getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // --- Submit: save bot, then upsert developer profile ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Image upload if provided
      let imageUrl = form.image_url || null;
      if (imageFile) {
        const loadingId = toast.loading("Uploading image…");
        try {
          imageUrl = await uploadImage(imageFile);
          toast.dismiss(loadingId);
        } catch (upErr) {
          toast.dismiss(loadingId);
          throw upErr;
        }
      }

      // 2) BOT payload (only columns that exist in bots table)
      const botPayload = {
        name: form.name?.trim(),
        developer_name: form.developer_name || null,
        version: form.version || null,
        description: form.description || null,
        github_url: form.github_url || null,
        zip_file_url: form.zip_file_url || null,
        developer_site: form.developer_site || null,
        posted_by: form.posted_by || null,
        status: form.status || "offline",
        deployment_hosts: form.deployment_hosts || [],
        image_url: imageUrl || null,
      };

      // 3) Insert/update bot
      if (editingBot) {
        const { error } = await supabase
          .from("bots")
          .update(botPayload)
          .eq("bot_id", editingBot.bot_id);
        if (error) throw error;
        toast.success("Bot updated");
      } else {
        const { error } = await supabase.from("bots").insert([botPayload]);
        if (error) throw error;
        toast.success("Bot posted");
      }

      // 4) Upsert developer profile (optional)
      const anyDevFieldFilled =
        (form.developer_name && form.developer_name.trim() !== "") ||
        (form.developer_description && form.developer_description.trim() !== "") ||
        (form.github_link && form.github_link.trim() !== "") ||
        (form.developer_site && form.developer_site.trim() !== "") ||
        (form.whatsapp_channel && form.whatsapp_channel.trim() !== "") ||
        (form.whatsapp_group && form.whatsapp_group.trim() !== "") ||
        (form.whatsapp_number && form.whatsapp_number.trim() !== "");

      if (anyDevFieldFilled) {
        try {
          // developers table must have UNIQUE(bot_name) referencing bots(name)
          const devPayload = {
            bot_name: form.name?.trim(), // link by bot name
            developer_name: form.developer_name || null,
            developer_description: form.developer_description || null,
            github_link: form.github_link || null,
            developer_site: form.developer_site || null,
            whatsapp_channel: form.whatsapp_channel || null,
            whatsapp_group: form.whatsapp_group || null,
            whatsapp_number: form.whatsapp_number || null,
          };

          const { error: devErr } = await supabase
            .from("developers")
            .upsert(devPayload, { onConflict: "bot_name" });
          if (devErr) throw devErr;
        } catch (devTableErr) {
          console.warn(devTableErr);
          toast(
            "Bot saved, but developer profile wasn’t stored (check `developers` table & UNIQUE(bot_name)).",
            { icon: "⚠️" }
          );
        }
      }

      // 5) Reset
      resetForm();
      fetchBots();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      developer_name: "",
      version: "",
      description: "",
      github_url: "",
      zip_file_url: "",
      developer_site: "",
      posted_by: "",
      status: "offline",
      deployment_hosts: [],
      image_url: "",

      developer_description: "",
      github_link: "",
      whatsapp_channel: "",
      whatsapp_group: "",
      whatsapp_number: "",
    });
    setImageFile(null);
    setEditingBot(null);
  };

  const deleteBot = async (bot) => {
    if (!confirm(`Delete bot "${bot.name}"?`)) return; // ✅ fixed backticks
    try {
      // remove image if it’s in this bucket
      if (bot.image_url?.includes("/storage/v1/object/public/bots/")) {
        const imagePath = bot.image_url.split("/storage/v1/object/public/bots/")[1];
        if (imagePath) {
          await supabase.storage.from("bots").remove([imagePath]);
        }
      }
      const { error } = await supabase.from("bots").delete().eq("bot_id", bot.bot_id);
      if (error) throw error;
      toast.success("Bot deleted");
      fetchBots();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  const editBot = async (bot) => {
    // base form from bot
    const base = {
      name: bot.name || "",
      developer_name: bot.developer_name || "",
      version: bot.version || "",
      description: bot.description || "",
      github_url: bot.github_url || "",
      zip_file_url: bot.zip_file_url || "",
      developer_site: bot.developer_site || "",
      posted_by: bot.posted_by || "",
      status: bot.status || "offline",
      deployment_hosts: bot.deployment_hosts || [],
      image_url: bot.image_url || "",

      // default empty dev profile until fetched
      developer_description: "",
      github_link: "",
      whatsapp_channel: "",
      whatsapp_group: "",
      whatsapp_number: "",
    };

    setForm(base);
    setEditingBot(bot);
    setImageFile(null);

    // fetch developer profile if table exists
    try {
      const { data: devRow, error: devErr } = await supabase
        .from("developers")
        .select("*")
        .eq("bot_name", bot.name)
        .maybeSingle();

      if (!devErr && devRow) {
        setForm((prev) => ({
          ...prev,
          developer_description: devRow.developer_description || "",
          github_link: devRow.github_link || "",
          // prefer developer_site in developer profile if present
          developer_site: devRow.developer_site || prev.developer_site,
          whatsapp_channel: devRow.whatsapp_channel || "",
          whatsapp_group: devRow.whatsapp_group || "",
          whatsapp_number: devRow.whatsapp_number || "",
        }));
      }
    } catch (e) {
      // developers table might not exist yet — ignore
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
            <div className="md:col-span-2">
              <label className="block text-sm text-green-300 mb-2">
                Bot Cover Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-green-500/20 focus:border-green-400 outline-none"
              />
              {form.image_url && (
                <p className="text-xs text-green-300 mt-2">
                  Current image: {form.image_url}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* DEPLOYMENT HOSTS */}
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            DEPLOYMENT HOSTS
          </h2>
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
                  checked={form.deployment_hosts.includes(host)}
                  onChange={handleChange}
                  className="accent-yellow-400"
                />
                <span className="text-sm">{host}</span>
              </label>
            ))}
          </div>
        </section>

        {/* DEVELOPER INFO (scrollable) */}
        <section className="border-t border-green-500/20 pt-4">
          <h2 className="text-xl font-bold text-blue-400 mb-3">DEVELOPER INFO</h2>
          <p className="text-xs text-blue-200/80 mb-3">
            Saved in <code>developers</code> table (linked by <b>bot_name</b>). Optional.
          </p>
          <div className="max-h-64 overflow-y-auto pr-1 space-y-3">
            <textarea
              name="developer_description"
              placeholder="Developer Description"
              value={form.developer_description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-800 border border-blue-500/20 focus:border-blue-400 outline-none"
            />
            <input
              type="url"
              name="github_link"
              placeholder="Developer GitHub Link"
              value={form.github_link}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-blue-500/20 focus:border-blue-400 outline-none"
            />
            <input
              type="url"
              name="whatsapp_channel"
              placeholder="WhatsApp Channel Link"
              value={form.whatsapp_channel}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-blue-500/20 focus:border-blue-400 outline-none"
            />
            <input
              type="url"
              name="whatsapp_group"
              placeholder="WhatsApp Group Link"
              value={form.whatsapp_group}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-blue-500/20 focus:border-blue-400 outline-none"
            />
            <input
              type="text"
              name="whatsapp_number"
              placeholder="WhatsApp Number"
              value={form.whatsapp_number}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 border border-blue-500/20 focus:border-blue-400 outline-none"
            />
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
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => editBot(bot)}
                    className="px-3 py-1.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBot(bot)}
                    className="px-3 py-1.5 bg-red-500 text-black rounded-lg hover:bg-red-400"
                  >
                    Delete
                  </button>
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
        Admin • Manage Bots & Developer Profiles
      </footer>
    </div>
  );
}

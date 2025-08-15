import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBots() {
  const [form, setForm] = useState({
    name: "",
    version: "",
    description: "",
    github_url: "",
    zip_file_url: "",
    posted_by: "",
    status: "offline",
    deployment_hosts: [],
    image_url: "",
    developer_name: "",
    developer_description: "",
    developer_site: "",
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
    "Heroku", "Render", "Replit", "Railway", "Vercel", "Katabump", "Own hosting"
  ];

  // Fetch bots
  const fetchBots = async () => {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Error loading bots");
    else setBots(data);
  };

  useEffect(() => {
    fetchBots();
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "deployment_hosts") {
      setForm((prev) => ({
        ...prev,
        deployment_hosts: checked
          ? [...prev.deployment_hosts, value]
          : prev.deployment_hosts.filter((host) => host !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload image
  const uploadImage = async (file) => {
    if (!file) return null;
    const filePath = `images/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("bots")
      .upload(filePath, file);
    if (error) throw error;
    const { data: publicData } = supabase.storage
      .from("bots")
      .getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image_url || null;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const botData = { ...form, image_url: imageUrl };

      if (editingBot) {
        const { error } = await supabase
          .from("bots")
          .update(botData)
          .eq("bot_id", editingBot.bot_id);
        if (error) throw error;
        toast.success("Bot updated!");
      } else {
        const { error } = await supabase.from("bots").insert([botData]);
        if (error) throw error;
        toast.success("Bot posted!");
      }

      resetForm();
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      version: "",
      description: "",
      github_url: "",
      zip_file_url: "",
      posted_by: "",
      status: "offline",
      deployment_hosts: [],
      image_url: "",
      developer_name: "",
      developer_description: "",
      developer_site: "",
      github_link: "",
      whatsapp_channel: "",
      whatsapp_group: "",
      whatsapp_number: "",
    });
    setImageFile(null);
    setEditingBot(null);
  };

  const deleteBot = async (bot) => {
    if (!confirm(`Delete bot "${bot.name}"?`)) return;
    try {
      if (bot.image_url) {
        const imagePath = bot.image_url.split(
          "/storage/v1/object/public/bots/"
        )[1];
        await supabase.storage.from("bots").remove([imagePath]);
      }
      const { error } = await supabase
        .from("bots")
        .delete()
        .eq("bot_id", bot.bot_id);
      if (error) throw error;
      toast.success("Bot deleted!");
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editBot = (bot) => {
    setForm(bot);
    setEditingBot(bot);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-6">
      <Toaster position="top-right" />

      <h1 className="text-4xl font-extrabold mb-6 text-center text-purple-400 drop-shadow-lg">
        {editingBot ? "✏️ Edit Bot" : "🚀 Post New Bot"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 max-w-4xl mx-auto"
      >
        {/* Bot Details */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-400">Bot Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Bot Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-green-400"
          />
          <input
            type="text"
            name="version"
            placeholder="Version"
            value={form.version}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            accept="image/*"
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="zip_file_url"
            placeholder="Direct ZIP Download Link"
            value={form.zip_file_url}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="github_url"
            placeholder="GitHub URL"
            value={form.github_url}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="text"
            name="posted_by"
            placeholder="Posted By"
            value={form.posted_by}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
        </div>

        {/* Deployment */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            Deployment Hosts
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {hostingOptions.map((host) => (
              <label key={host} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="deployment_hosts"
                  value={host}
                  checked={form.deployment_hosts.includes(host)}
                  onChange={handleChange}
                  className="accent-green-400"
                />
                {host}
              </label>
            ))}
          </div>
        </div>

        {/* Developer Section */}
        <div className="space-y-4 max-h-64 overflow-y-auto border-t border-gray-600 pt-4">
          <h2 className="text-2xl font-bold text-blue-400">
            Developer Information
          </h2>
          <input
            type="text"
            name="developer_name"
            placeholder="Developer Name"
            value={form.developer_name}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <textarea
            name="developer_description"
            placeholder="Developer Description"
            value={form.developer_description}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="developer_site"
            placeholder="Developer Website"
            value={form.developer_site}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="github_link"
            placeholder="Developer GitHub Link"
            value={form.github_link}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="whatsapp_channel"
            placeholder="WhatsApp Channel Link"
            value={form.whatsapp_channel}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="url"
            name="whatsapp_group"
            placeholder="WhatsApp Group Link"
            value={form.whatsapp_group}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
          <input
            type="text"
            name="whatsapp_number"
            placeholder="WhatsApp Number"
            value={form.whatsapp_number}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition"
          >
            {loading
              ? "Saving..."
              : editingBot
              ? "Update Bot"
              : "Post Bot"}
          </button>
          {editingBot && (
            <button
              type="button"
              onClick={resetForm}
              className="p-3 bg-gray-500 text-black font-bold rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* All Bots Table */}
      <h2 className="text-2xl font-bold mt-10 mb-4">All Bots</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3">Name</th>
              <th className="p-3">Developer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.bot_id} className="border-t border-gray-700">
                <td className="p-3">{bot.name}</td>
                <td className="p-3">{bot.developer_name}</td>
                <td className="p-3">{bot.status}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => editBot(bot)}
                    className="p-2 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBot(bot)}
                    className="p-2 bg-red-500 text-black rounded hover:bg-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
    }

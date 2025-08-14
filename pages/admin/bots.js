import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBots() {
  const [form, setForm] = useState({
    name: "",
    developer_name: "",
    version: "",
    description: "",
    github_url: "",
    developer_site: "",
    posted_by: "",
    status: "offline",
    deployment_hosts: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bots, setBots] = useState([]);
  const [editingBot, setEditingBot] = useState(null);

  const hostingOptions = [
    "Heroku", "Render", "Replit", "Railway", "Vercel", "Katabump", "Own hosting"
  ];

  // Fetch bots from DB
  const fetchBots = async () => {
    const { data, error } = await supabase.from("bots").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Error loading bots");
    } else {
      setBots(data);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  // Handle form changes
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

  // Upload file to storage
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const filePath = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("bots").upload(filePath, file);
    if (error) throw error;
    const { data: publicData } = supabase.storage.from("bots").getPublicUrl(filePath);
    return publicData.publicUrl;
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image_url || null;
      let zipUrl = form.zip_file_url || null;

      if (imageFile) imageUrl = await uploadFile(imageFile, "images");
      if (zipFile) zipUrl = await uploadFile(zipFile, "zips");

      if (editingBot) {
        // Update bot
        const { error } = await supabase.from("bots").update({
          ...form,
          image_url: imageUrl,
          zip_file_url: zipUrl,
        }).eq("bot_id", editingBot.bot_id);

        if (error) throw error;
        toast.success("Bot updated!");
      } else {
        // Create bot
        const { error } = await supabase.from("bots").insert([{
          ...form,
          image_url: imageUrl,
          zip_file_url: zipUrl,
        }]);
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
      developer_name: "",
      version: "",
      description: "",
      github_url: "",
      developer_site: "",
      posted_by: "",
      status: "offline",
      deployment_hosts: [],
    });
    setImageFile(null);
    setZipFile(null);
    setEditingBot(null);
  };

  // Delete bot and its files
  const deleteBot = async (bot) => {
    if (!confirm(`Delete bot "${bot.name}"?`)) return;

    try {
      // Remove files from storage
      if (bot.image_url) {
        const imagePath = bot.image_url.split("/storage/v1/object/public/bots/")[1];
        await supabase.storage.from("bots").remove([imagePath]);
      }
      if (bot.zip_file_url) {
        const zipPath = bot.zip_file_url.split("/storage/v1/object/public/bots/")[1];
        await supabase.storage.from("bots").remove([zipPath]);
      }

      // Remove from DB
      const { error } = await supabase.from("bots").delete().eq("bot_id", bot.bot_id);
      if (error) throw error;

      toast.success("Bot deleted!");
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Start editing bot
  const editBot = (bot) => {
    setForm(bot);
    setEditingBot(bot);
    setImageFile(null);
    setZipFile(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6">{editingBot ? "Edit Bot" : "Post New Bot"}</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg space-y-4 max-w-3xl mx-auto">
        <input type="text" name="name" placeholder="Bot Name" value={form.name} onChange={handleChange} required className="w-full p-3 rounded bg-gray-800" />
        <input type="text" name="developer_name" placeholder="Developer Name" value={form.developer_name} onChange={handleChange} required className="w-full p-3 rounded bg-gray-800" />
        <input type="text" name="version" placeholder="Version" value={form.version} onChange={handleChange} className="w-full p-3 rounded bg-gray-800" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="w-full p-3 rounded bg-gray-800"></textarea>

        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" className="w-full p-3 rounded bg-gray-800" />
        <input type="file" onChange={(e) => setZipFile(e.target.files[0])} accept=".zip" className="w-full p-3 rounded bg-gray-800" />

        <input type="url" name="github_url" placeholder="GitHub URL" value={form.github_url} onChange={handleChange} className="w-full p-3 rounded bg-gray-800" />
        <input type="url" name="developer_site" placeholder="Developer Site" value={form.developer_site} onChange={handleChange} className="w-full p-3 rounded bg-gray-800" />
        <input type="text" name="posted_by" placeholder="Posted By" value={form.posted_by} onChange={handleChange} className="w-full p-3 rounded bg-gray-800" />

        <select name="status" value={form.status} onChange={handleChange} className="w-full p-3 rounded bg-gray-800">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <div>
          <p className="font-bold">Deployment Hosts:</p>
          {hostingOptions.map((host) => (
            <label key={host} className="block">
              <input type="checkbox" name="deployment_hosts" value={host} checked={form.deployment_hosts.includes(host)} onChange={handleChange} className="mr-2" />
              {host}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="w-full p-3 bg-green-500 text-black font-bold rounded">
            {loading ? "Saving..." : editingBot ? "Update Bot" : "Post Bot"}
          </button>
          {editingBot && (
            <button type="button" onClick={resetForm} className="p-3 bg-gray-500 text-black font-bold rounded">Cancel</button>
          )}
        </div>
      </form>

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
                  <button onClick={() => editBot(bot)} className="p-2 bg-yellow-500 text-black rounded">Edit</button>
                  <button onClick={() => deleteBot(bot)} className="p-2 bg-red-500 text-black rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
    }

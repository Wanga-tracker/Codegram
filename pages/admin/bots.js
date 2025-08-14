// pages/admin/bots.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function BotsAdmin() {
  const [bots, setBots] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    developer_name: "",
    description: "",
    github_url: "",
    developer_site: "",
    status: "offline",
    deployment_hosts: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch bots
  async function fetchBots() {
    const { data, error } = await supabase.from("bots").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setBots(data);
  }

  useEffect(() => {
    fetchBots();
  }, []);

  // ✅ Handle form input
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // ✅ Handle checkbox
  function handleDeploymentChange(host) {
    setFormData(prev => {
      const exists = prev.deployment_hosts.includes(host);
      return {
        ...prev,
        deployment_hosts: exists
          ? prev.deployment_hosts.filter(h => h !== host)
          : [...prev.deployment_hosts, host],
      };
    });
  }

  // ✅ Post bot
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image
      let image_url = null;
      if (imageFile) {
        const { data: imgData, error: imgErr } = await supabase.storage
          .from("bot-files")
          .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);
        if (imgErr) throw imgErr;
        image_url = supabase.storage.from("bot-files").getPublicUrl(imgData.path).data.publicUrl;
      }

      // Upload ZIP
      let zip_file_url = null;
      if (zipFile) {
        const { data: zipData, error: zipErr } = await supabase.storage
          .from("bot-files")
          .upload(`zips/${Date.now()}_${zipFile.name}`, zipFile);
        if (zipErr) throw zipErr;
        zip_file_url = supabase.storage.from("bot-files").getPublicUrl(zipData.path).data.publicUrl;
      }

      // Insert into DB
      const { error: insertErr } = await supabase.from("bots").insert([
        {
          ...formData,
          image_url,
          zip_file_url,
        },
      ]);

      if (insertErr) throw insertErr;

      toast.success("Bot posted successfully!");
      setFormData({
        name: "",
        developer_name: "",
        description: "",
        github_url: "",
        developer_site: "",
        status: "offline",
        deployment_hosts: [],
      });
      setImageFile(null);
      setZipFile(null);
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Delete bot + files
  async function deleteBot(bot) {
    if (!confirm(`Delete bot "${bot.name}"?`)) return;

    try {
      // Delete image
      if (bot.image_url) {
        const imagePath = bot.image_url.split("/storage/v1/object/public/bot-files/")[1];
        await supabase.storage.from("bot-files").remove([imagePath]);
      }
      // Delete zip
      if (bot.zip_file_url) {
        const zipPath = bot.zip_file_url.split("/storage/v1/object/public/bot-files/")[1];
        await supabase.storage.from("bot-files").remove([zipPath]);
      }

      // Delete from DB
      const { error } = await supabase.from("bots").delete().eq("bot_id", bot.bot_id);
      if (error) throw error;

      toast.success("Bot deleted successfully!");
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900 dark:text-white">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">🚀 Manage Bots</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Bot Name" className="input" />
        <input name="developer_name" value={formData.developer_name} onChange={handleChange} placeholder="Developer Name" className="input" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input" />
        <input name="github_url" value={formData.github_url} onChange={handleChange} placeholder="GitHub URL" className="input" />
        <input name="developer_site" value={formData.developer_site} onChange={handleChange} placeholder="Developer Site" className="input" />

        {/* Status */}
        <select name="status" value={formData.status} onChange={handleChange} className="input">
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {/* Deployment Hosts */}
        <fieldset>
          <legend className="text-sm font-medium">Deployment Hosts</legend>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Heroku", "Render", "Replit", "Railway", "Vercel", "Katabump", "Own Hosting"].map(host => (
              <label key={host} className="flex items-center gap-2">
                <input type="checkbox" checked={formData.deployment_hosts.includes(host)} onChange={() => handleDeploymentChange(host)} />
                {host}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Files */}
        <input type="file" onChange={e => setImageFile(e.target.files[0])} className="input" />
        <input type="file" onChange={e => setZipFile(e.target.files[0])} className="input" />

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
          {loading ? "Posting..." : "Post Bot"}
        </button>
      </form>

      {/* Bot List */}
      <div className="mt-8">
        {bots.length === 0 ? (
          <p className="text-center text-gray-500">No bots posted yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th>Image</th>
                <th>Name</th>
                <th>Developer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bots.map(bot => (
                <tr key={bot.bot_id} className="border-b border-gray-800">
                  <td>{bot.image_url && <img src={bot.image_url} alt={bot.name} className="w-12 h-12 rounded" />}</td>
                  <td>{bot.name}</td>
                  <td>{bot.developer_name}</td>
                  <td>{bot.status}</td>
                  <td>
                    <button onClick={() => deleteBot(bot)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #ccc;
          background-color: inherit;
          color: inherit;
        }
      `}</style>
    </div>
  );
    }

// pages/admin/bots.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AdminBots() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialForm());
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function initialForm() {
    return {
      name: "",
      developer_name: "",
      description: "",
      deployment_hosts: "",
      github_url: "",
      developer_site: "",
      status: "online",
      zip_file: null,
      image_file: null,
    };
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        fetchBots();
      }
    });
  }, []);

  async function fetchBots() {
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setBots(data);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function uploadFile(file, folder) {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("bot_files")
      .upload(`${folder}/${fileName}`, file, { upsert: false });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from("bot_files")
      .getPublicUrl(`${folder}/${fileName}`);
    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.developer_name || !formData.description) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);

    const zip_file_url = await uploadFile(formData.zip_file, "zips");
    const image_url = await uploadFile(formData.image_file, "images");

    const botPayload = {
      name: formData.name,
      developer_name: formData.developer_name,
      description: formData.description,
      deployment_hosts: formData.deployment_hosts,
      github_url: formData.github_url,
      developer_site: formData.developer_site,
      status: formData.status,
      created_by: user?.id,
      posted_by: user?.id,
    };

    if (zip_file_url) botPayload.zip_file_url = zip_file_url;
    if (image_url) botPayload.image_url = image_url;

    let error;
    if (editingId) {
      ({ error } = await supabase.from("bots").update(botPayload).eq("bot_id", editingId));
      setEditingId(null);
    } else {
      ({ error } = await supabase.from("bots").insert(botPayload));
    }

    setLoading(false);
    if (error) {
      console.error("Save error:", error.message);
      alert("Error saving bot");
    } else {
      alert(editingId ? "Bot updated!" : "Bot added!");
      setFormData(initialForm());
      fetchBots();
    }
  }

  async function handleEdit(bot) {
    setFormData({
      ...bot,
      zip_file: null,
      image_file: null,
    });
    setEditingId(bot.bot_id);
  }

  async function handleDelete(bot_id) {
    if (!confirm("Are you sure you want to delete this bot?")) return;
    const { error } = await supabase.from("bots").delete().eq("bot_id", bot_id);
    if (!error) {
      fetchBots();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-6">
        {editingId ? "✏️ Edit Bot" : "🚀 Add New Bot"}
      </h1>

      {/* Bot Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4 bg-gray-900 p-6 rounded-2xl border border-green-500 shadow-[0_0_15px_#00ff7f]"
      >
        <input type="text" name="name" placeholder="Bot Name *" value={formData.name} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <input type="text" name="developer_name" placeholder="Developer Name *" value={formData.developer_name} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <textarea name="description" placeholder="Description *" value={formData.description} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <input type="text" name="deployment_hosts" placeholder="Deployment Hosts (comma-separated)" value={formData.deployment_hosts} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <input type="url" name="github_url" placeholder="GitHub URL" value={formData.github_url} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <input type="url" name="developer_site" placeholder="Developer Site" value={formData.developer_site} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg" />
        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-black border border-green-400 rounded-lg">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <div>
          <label className="block text-green-300 mb-1">Bot Zip File</label>
          <input type="file" name="zip_file" onChange={handleChange} />
        </div>
        <div>
          <label className="block text-green-300 mb-1">Bot Image</label>
          <input type="file" name="image_file" onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="w-full p-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400">
          {loading ? "Saving..." : editingId ? "Update Bot" : "Save Bot"}
        </button>
      </form>

      {/* Bots List */}
      <div className="mt-10 max-h-[400px] overflow-y-auto border-t border-green-500 pt-4">
        <h2 className="text-2xl font-bold mb-4">📜 Saved Bots</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <div key={bot.bot_id} className="bg-gray-800 p-4 rounded-xl shadow-lg border border-green-500">
              <img src={bot.image_url} alt={bot.name} className="w-full h-40 object-cover rounded-lg mb-2" />
              <h3 className="text-xl font-bold text-green-400">{bot.name}</h3>
              <p className="text-sm text-gray-300">{bot.description}</p>
              <p className="text-xs text-gray-500 mt-1">Developer: {bot.developer_name}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(bot)} className="flex-1 p-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400">Edit</button>
                <button onClick={() => handleDelete(bot.bot_id)} className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
    }

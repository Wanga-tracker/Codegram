// pages/admin/bots.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBots() {
  const [bots, setBots] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "online",
    developer_name: "",
    developer_description: "",
    github_link: "",
    developer_site: "",
    whatsapp_channel: "",
    whatsapp_group: "",
    whatsapp_number: ""
  });
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    const { data, error } = await supabase
      .from("bots")
      .select("*, developers(*)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setBots(data);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Bot name is required");
      return;
    }

    // Insert or update bot
    const botPayload = {
      name: formData.name,
      description: formData.description,
      status: formData.status
    };

    let botResult;
    if (editId) {
      botResult = await supabase.from("bots").update(botPayload).eq("id", editId).select();
    } else {
      botResult = await supabase.from("bots").insert([botPayload]).select();
    }

    if (botResult.error) {
      toast.error(botResult.error.message);
      return;
    }

    const botName = formData.name;

    // Insert or update developer
    const devPayload = {
      bot_name: botName,
      developer_name: formData.developer_name,
      developer_description: formData.developer_description,
      github_link: formData.github_link,
      developer_site: formData.developer_site,
      whatsapp_channel: formData.whatsapp_channel,
      whatsapp_group: formData.whatsapp_group,
      whatsapp_number: formData.whatsapp_number
    };

    const { error: devError } = await supabase
      .from("developers")
      .upsert([devPayload], { onConflict: "bot_name" });

    if (devError) {
      toast.error(devError.message);
      return;
    }

    toast.success(editId ? "Bot updated successfully" : "Bot created successfully");
    setFormData({
      name: "",
      description: "",
      status: "online",
      developer_name: "",
      developer_description: "",
      github_link: "",
      developer_site: "",
      whatsapp_channel: "",
      whatsapp_group: "",
      whatsapp_number: ""
    });
    setEditId(null);
    fetchBots();
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("bots").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bot deleted");
      fetchBots();
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Manage Bots</h1>

      {/* Bot Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-800 p-4 rounded-lg">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Bot Name" className="p-2 bg-gray-700 rounded" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Bot Description" className="p-2 bg-gray-700 rounded" />
        <select name="status" value={formData.status} onChange={handleChange} className="p-2 bg-gray-700 rounded">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <input type="text" name="developer_name" value={formData.developer_name} onChange={handleChange} placeholder="Developer Name" className="p-2 bg-gray-700 rounded" />
        <textarea name="developer_description" value={formData.developer_description} onChange={handleChange} placeholder="Developer Description" className="p-2 bg-gray-700 rounded" />
        <input type="text" name="github_link" value={formData.github_link} onChange={handleChange} placeholder="GitHub Link" className="p-2 bg-gray-700 rounded" />
        <input type="text" name="developer_site" value={formData.developer_site} onChange={handleChange} placeholder="Developer Site" className="p-2 bg-gray-700 rounded" />
        <input type="text" name="whatsapp_channel" value={formData.whatsapp_channel} onChange={handleChange} placeholder="WhatsApp Channel" className="p-2 bg-gray-700 rounded" />
        <input type="text" name="whatsapp_group" value={formData.whatsapp_group} onChange={handleChange} placeholder="WhatsApp Group" className="p-2 bg-gray-700 rounded" />
        <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="WhatsApp Number" className="p-2 bg-gray-700 rounded" />

        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">
          {editId ? "Update Bot" : "Create Bot"}
        </button>
      </form>

      {/* Bot List */}
      <div className="space-y-4 overflow-y-auto max-h-[500px]">
        {bots.map(bot => (
          <div key={bot.id} className="p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold">{bot.name}</h2>
            <p>{bot.description}</p>
            <p>Status: <span className="capitalize">{bot.status}</span></p>
            {bot.developers && bot.developers.length > 0 && (
              <div className="mt-2 p-2 bg-gray-700 rounded">
                <h3 className="font-semibold">Developer Info</h3>
                <p>{bot.developers[0].developer_name}</p>
                <p>{bot.developers[0].developer_description}</p>
              </div>
            )}

            {confirmDeleteId === bot.id ? (
              <div className="mt-2 flex gap-2">
                <button onClick={() => handleDelete(bot.id)} className="bg-red-500 px-3 py-1 rounded">Yes</button>
                <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-500 px-3 py-1 rounded">No</button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <button onClick={() => {
                  setFormData({
                    name: bot.name,
                    description: bot.description,
                    status: bot.status,
                    developer_name: bot.developers?.[0]?.developer_name || "",
                    developer_description: bot.developers?.[0]?.developer_description || "",
                    github_link: bot.developers?.[0]?.github_link || "",
                    developer_site: bot.developers?.[0]?.developer_site || "",
                    whatsapp_channel: bot.developers?.[0]?.whatsapp_channel || "",
                    whatsapp_group: bot.developers?.[0]?.whatsapp_group || "",
                    whatsapp_number: bot.developers?.[0]?.whatsapp_number || ""
                  });
                  setEditId(bot.id);
                }} className="bg-blue-500 px-3 py-1 rounded">Edit</button>
                <button onClick={() => setConfirmDeleteId(bot.id)} className="bg-red-500 px-3 py-1 rounded">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
      }

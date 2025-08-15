import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function AdminBots() {
  const [botData, setBotData] = useState({
    name: "",
    developer_name: "",
    description: "",
    zip_file_url: "",
    image_url: "",
    deployment_hosts: [],
    github_url: "",
    rank: "",
    status: "Online",
    developer_site: "",
    // Developer fields
    developer_description: "",
    dev_github_link: "",
    dev_site: "",
    whatsapp_channel: "",
    whatsapp_group: "",
    whatsapp_number: ""
  });

  const [botsList, setBotsList] = useState([]);

  const deploymentOptions = ["Heroku", "Render", "Railway", "Vercel", "Other"];

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    const { data, error } = await supabase
      .from("bots")
      .select("*, developers(*)")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    else setBotsList(data);
  }

  const handleCheckboxChange = (option) => {
    setBotData((prev) => {
      const updated = prev.deployment_hosts.includes(option)
        ? prev.deployment_hosts.filter((o) => o !== option)
        : [...prev.deployment_hosts, option];
      return { ...prev, deployment_hosts: updated };
    });
  };

  async function saveBot() {
    if (!botData.name || !botData.developer_name) {
      toast.error("Bot Name and Developer Name are required");
      return;
    }

    const { error: botError } = await supabase.from("bots").upsert({
      name: botData.name,
      developer_name: botData.developer_name,
      description: botData.description,
      zip_file_url: botData.zip_file_url,
      image_url: botData.image_url,
      deployment_hosts: botData.deployment_hosts,
      github_url: botData.github_url,
      rank: botData.rank,
      status: botData.status,
      developer_site: botData.developer_site
    });

    if (botError) {
      toast.error(botError.message);
      return;
    }

    const { error: devError } = await supabase.from("developers").upsert({
      bot_name: botData.name,
      developer_name: botData.developer_name,
      developer_description: botData.developer_description,
      github_link: botData.dev_github_link,
      developer_site: botData.dev_site,
      whatsapp_channel: botData.whatsapp_channel,
      whatsapp_group: botData.whatsapp_group,
      whatsapp_number: botData.whatsapp_number
    });

    if (devError) {
      toast.error(devError.message);
      return;
    }

    toast.success("Bot & Developer saved successfully");
    setBotData({
      name: "",
      developer_name: "",
      description: "",
      zip_file_url: "",
      image_url: "",
      deployment_hosts: [],
      github_url: "",
      rank: "",
      status: "Online",
      developer_site: "",
      developer_description: "",
      dev_github_link: "",
      dev_site: "",
      whatsapp_channel: "",
      whatsapp_group: "",
      whatsapp_number: ""
    });
    fetchBots();
  }

  async function deleteBot(name) {
    if (confirm(`Delete bot "${name}"?`)) {
      const { error } = await supabase.from("bots").delete().eq("name", name);
      if (error) toast.error(error.message);
      else {
        toast.success("Bot deleted");
        fetchBots();
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-neon-green">Add / Edit Bot</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bot Fields */}
        <input placeholder="Bot Name" value={botData.name} onChange={(e) => setBotData({ ...botData, name: e.target.value })} className="input" />
        <input placeholder="Developer Name" value={botData.developer_name} onChange={(e) => setBotData({ ...botData, developer_name: e.target.value })} className="input" />
        <textarea placeholder="Description" value={botData.description} onChange={(e) => setBotData({ ...botData, description: e.target.value })} className="input" />
        <input placeholder="ZIP File URL" value={botData.zip_file_url} onChange={(e) => setBotData({ ...botData, zip_file_url: e.target.value })} className="input" />
        <input placeholder="Image URL" value={botData.image_url} onChange={(e) => setBotData({ ...botData, image_url: e.target.value })} className="input" />
        {/* Deployment Hosts */}
        <div className="col-span-2">
          <p className="font-semibold">Deployment Hosts:</p>
          <div className="flex flex-wrap gap-3">
            {deploymentOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input type="checkbox" checked={botData.deployment_hosts.includes(opt)} onChange={() => handleCheckboxChange(opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
        <input placeholder="GitHub URL" value={botData.github_url} onChange={(e) => setBotData({ ...botData, github_url: e.target.value })} className="input" />
        <input placeholder="Rank" value={botData.rank} onChange={(e) => setBotData({ ...botData, rank: e.target.value })} className="input" />
        <select value={botData.status} onChange={(e) => setBotData({ ...botData, status: e.target.value })} className="input">
          <option>Online</option>
          <option>Offline</option>
          <option>Maintenance</option>
        </select>
        <input placeholder="Developer Site" value={botData.developer_site} onChange={(e) => setBotData({ ...botData, developer_site: e.target.value })} className="input" />

        {/* Developer Fields */}
        <textarea placeholder="Developer Description" value={botData.developer_description} onChange={(e) => setBotData({ ...botData, developer_description: e.target.value })} className="input" />
        <input placeholder="Developer GitHub Link" value={botData.dev_github_link} onChange={(e) => setBotData({ ...botData, dev_github_link: e.target.value })} className="input" />
        <input placeholder="Developer Site" value={botData.dev_site} onChange={(e) => setBotData({ ...botData, dev_site: e.target.value })} className="input" />
        <input placeholder="WhatsApp Channel Link" value={botData.whatsapp_channel} onChange={(e) => setBotData({ ...botData, whatsapp_channel: e.target.value })} className="input" />
        <input placeholder="WhatsApp Group Link" value={botData.whatsapp_group} onChange={(e) => setBotData({ ...botData, whatsapp_group: e.target.value })} className="input" />
        <input placeholder="WhatsApp Number" value={botData.whatsapp_number} onChange={(e) => setBotData({ ...botData, whatsapp_number: e.target.value })} className="input" />
      </div>

      <button onClick={saveBot} className="bg-neon-green text-black px-6 py-2 rounded">Save Bot</button>

      {/* Bots List */}
      <div className="mt-8 space-y-4 max-h-96 overflow-y-auto">
        {botsList.map((bot) => (
          <div key={bot.name} className="p-4 bg-gray-800 rounded flex justify-between items-center">
            <div>
              <p className="font-bold">{bot.name}</p>
              <p className="text-sm">{bot.developer_name}</p>
            </div>
            <button onClick={() => deleteBot(bot.name)} className="text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
      }

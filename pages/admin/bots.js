// pages/admin/bots.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

export default function AdminBots() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState());
  const [isEditing, setIsEditing] = useState(false);

  const deploymentOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own Hosting",
  ];

  function initialFormState() {
    return {
      bot_id: null,
      name: "",
      developer_name: "",
      version: "",
      description: "",
      github_url: "",
      developer_site: "",
      posted_by: "",
      status: "offline",
      deployment_hosts: [],
      imageFile: null,
      zipFile: null,
      image_url: "",
      zip_file_url: "",
    };
  }

  // Fetch bots
  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setBots(data);
    setLoading(false);
  }

  function handleCheckboxChange(host) {
    setFormData((prev) => {
      const exists = prev.deployment_hosts.includes(host);
      return {
        ...prev,
        deployment_hosts: exists
          ? prev.deployment_hosts.filter((h) => h !== host)
          : [...prev.deployment_hosts, host],
      };
    });
  }

  async function uploadFile(file, folder) {
    if (!file) return "";
    const filePath = `${folder}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("bots")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: publicUrl } = supabase.storage
      .from("bots")
      .getPublicUrl(filePath);
    return publicUrl.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      let zipUrl = formData.zip_file_url;

      if (formData.imageFile) {
        imageUrl = await uploadFile(formData.imageFile, "images");
      }
      if (formData.zipFile) {
        zipUrl = await uploadFile(formData.zipFile, "zips");
      }

      const payload = {
        name: formData.name,
        developer_name: formData.developer_name,
        version: formData.version,
        description: formData.description,
        github_url: formData.github_url,
        developer_site: formData.developer_site,
        posted_by: formData.posted_by,
        status: formData.status,
        deployment_hosts: formData.deployment_hosts,
        image_url: imageUrl,
        zip_file_url: zipUrl,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("bots")
          .update(payload)
          .eq("bot_id", formData.bot_id);
        if (error) throw error;
        toast.success("Bot updated successfully!");
      } else {
        const { error } = await supabase.from("bots").insert(payload);
        if (error) throw error;
        toast.success("Bot posted successfully!");
      }

      setFormData(initialFormState());
      setIsEditing(false);
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  }

  async function handleEdit(bot) {
    setFormData({ ...bot, imageFile: null, zipFile: null });
    setIsEditing(true);
  }

  async function handleDelete(bot) {
    if (!confirm(`Delete bot "${bot.name}"?`)) return;
    setLoading(true);
    try {
      // Delete files from storage if exist
      if (bot.image_url) {
        const path = bot.image_url.split("/storage/v1/object/public/bots/")[1];
        await supabase.storage.from("bots").remove([path]);
      }
      if (bot.zip_file_url) {
        const path = bot.zip_file_url.split("/storage/v1/object/public/bots/")[1];
        await supabase.storage.from("bots").remove([path]);
      }
      const { error } = await supabase.from("bots").delete().eq("bot_id", bot.bot_id);
      if (error) throw error;
      toast.success("Bot deleted!");
      fetchBots();
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Admin - Bots</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          type="text"
          placeholder="Bot Name"
          className="border p-2 rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Developer Name"
          className="border p-2 rounded"
          value={formData.developer_name}
          onChange={(e) =>
            setFormData({ ...formData, developer_name: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Version"
          className="border p-2 rounded"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        />
        <input
          type="text"
          placeholder="Posted By"
          className="border p-2 rounded"
          value={formData.posted_by}
          onChange={(e) =>
            setFormData({ ...formData, posted_by: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          className="border p-2 rounded col-span-full"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="GitHub URL"
          className="border p-2 rounded"
          value={formData.github_url}
          onChange={(e) =>
            setFormData({ ...formData, github_url: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Developer Site"
          className="border p-2 rounded"
          value={formData.developer_site}
          onChange={(e) =>
            setFormData({ ...formData, developer_site: e.target.value })
          }
        />

        {/* Status dropdown */}
        <select
          className="border p-2 rounded"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        {/* Deployment hosts */}
        <div className="col-span-full">
          <p className="font-medium mb-2">Deployment Hosts:</p>
          <div className="flex flex-wrap gap-3">
            {deploymentOptions.map((host) => (
              <label key={host} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.deployment_hosts.includes(host)}
                  onChange={() => handleCheckboxChange(host)}
                />
                {host}
              </label>
            ))}
          </div>
        </div>

        {/* File uploads */}
        <div>
          <p className="font-medium mb-1">Image (optional)</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, imageFile: e.target.files[0] })
            }
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Bot"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>
        <div>
          <p className="font-medium mb-1">ZIP File</p>
          <input
            type="file"
            accept=".zip"
            onChange={(e) =>
              setFormData({ ...formData, zipFile: e.target.files[0] })
            }
          />
        </div>

        <button
          type="submit"
          className="col-span-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          {isEditing ? "Update Bot" : "Post Bot"}
        </button>
      </form>

      {/* Bots table */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Developer</th>
              <th className="p-2 border">Version</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.bot_id}>
                <td className="p-2 border">
                  {bot.image_url ? (
                    <img
                      src={bot.image_url}
                      alt={bot.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="p-2 border">{bot.name}</td>
                <td className="p-2 border">{bot.developer_name}</td>
                <td className="p-2 border">{bot.version || "-"}</td>
                <td className="p-2 border">{bot.status}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(bot)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bot)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {bots.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No bots posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  }

// pages/admin/bots.js
import { useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function AdminBots() {
  const router = useRouter();
  const [form, setForm] = useState({
    botImage: null,
    zipFile: null,
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
  const [loading, setLoading] = useState(false);

  const hostOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own hosting",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleCheckboxChange = (host) => {
    setForm((prev) => {
      const isSelected = prev.deployment_hosts.includes(host);
      return {
        ...prev,
        deployment_hosts: isSelected
          ? prev.deployment_hosts.filter((h) => h !== host)
          : [...prev.deployment_hosts, host],
      };
    });
  };

  const uploadFile = async (file, pathPrefix) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;

    const { error } = await supabase.storage
      .from("bots")
      .upload(filePath, file, { upsert: false });

    if (error) {
      throw error;
    }
    const { data: publicUrl } = supabase.storage
      .from("bots")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrl = await uploadFile(form.botImage, "images");
      const zipUrl = await uploadFile(form.zipFile, "zips");

      const { error } = await supabase.from("bots").insert([
        {
          name: form.name,
          developer_name: form.developer_name,
          version: form.version,
          description: form.description,
          image_url: imageUrl,
          zip_file_url: zipUrl,
          github_url: form.github_url || null,
          developer_site: form.developer_site || null,
          posted_by: form.posted_by,
          status: form.status,
          deployment_hosts: form.deployment_hosts,
        },
      ]);

      if (error) throw error;
      toast.success("Bot posted successfully!");
      setTimeout(() => {
        router.push("/admin/bots");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Error posting bot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster />
      <h1 className="text-3xl font-bold text-neon mb-4">Post New Bot</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4 bg-gray-900 p-6 rounded-lg shadow-lg"
      >
        <input
          type="file"
          name="botImage"
          onChange={handleFileChange}
          accept="image/*"
          className="block w-full text-sm text-gray-300"
        />

        <input
          type="text"
          name="name"
          placeholder="Bot Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        <input
          type="text"
          name="developer_name"
          placeholder="Developer Name"
          value={form.developer_name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        <input
          type="text"
          name="version"
          placeholder="Bot Version"
          value={form.version}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
        />

        <textarea
          name="description"
          placeholder="Bot Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        ></textarea>

        <input
          type="file"
          name="zipFile"
          onChange={handleFileChange}
          accept=".zip"
          className="block w-full text-sm text-gray-300"
        />

        <input
          type="url"
          name="github_url"
          placeholder="GitHub URL"
          value={form.github_url}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
        />

        <input
          type="url"
          name="developer_site"
          placeholder="Developer Site"
          value={form.developer_site}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
        />

        <input
          type="text"
          name="posted_by"
          placeholder="Posted By"
          value={form.posted_by}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <div>
          <p className="mb-2">Deployment Hosts:</p>
          {hostOptions.map((host) => (
            <label key={host} className="block">
              <input
                type="checkbox"
                checked={form.deployment_hosts.includes(host)}
                onChange={() => handleCheckboxChange(host)}
              />
              <span className="ml-2">{host}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-neon px-4 py-2 rounded hover:shadow-neon transition"
        >
          {loading ? "Posting..." : "Post Bot"}
        </button>
      </form>
    </div>
  );
    }

// pages/admin/bots.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import { Bars3Icon } from "@heroicons/react/24/solid";

export default function AdminBots() {
  const router = useRouter();

  const [form, setForm] = useState({
    botImage: null,
    botName: "",
    developerName: "",
    botVersion: "",
    description: "",
    zipFile: null,
    githubUrl: "",
    developerSite: "",
    postedBy: "Admin",
    status: "offline",
    deploymentHosts: [],
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hostingsOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own Hosting",
  ];

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "botImage" || name === "zipFile") {
      setForm((prev) => ({ ...prev, [name]: files[0] || null }));
      return;
    }

    if (name === "deploymentHosts") {
      let updatedHosts = [...form.deploymentHosts];
      if (checked) {
        updatedHosts.push(value);
      } else {
        updatedHosts = updatedHosts.filter((h) => h !== value);
      }
      setForm((prev) => ({ ...prev, deploymentHosts: updatedHosts }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("bots")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("bots").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.botName || !form.developerName || !form.description) {
      return toast.error("Please fill all required fields.");
    }

    setLoading(true);
    toast.loading("Posting bot...", { id: "posting" });

    try {
      // Upload files
      const imageUrl = await uploadFile(form.botImage, "images");
      const zipUrl = await uploadFile(form.zipFile, "zips");

      // Insert bot into Supabase
      const { data, error } = await supabase.from("bots").insert([
        {
          name: form.botName,
          developer_name: form.developerName,
          version: form.botVersion,
          description: form.description,
          image_url: imageUrl,
          zip_file_url: zipUrl,
          github_url: form.githubUrl,
          developer_site: form.developerSite,
          posted_by: form.postedBy,
          status: form.status,
          deployment_hosts: form.deploymentHosts,
          created_at: new Date(),
        },
      ]);

      toast.remove("posting");
      if (error) throw error;

      toast.success("Bot posted successfully!");
      setForm({
        botImage: null,
        botName: "",
        developerName: "",
        botVersion: "",
        description: "",
        zipFile: null,
        githubUrl: "",
        developerSite: "",
        postedBy: "Admin",
        status: "offline",
        deploymentHosts: [],
      });
    } catch (err) {
      toast.remove("posting");
      toast.error(err.message || "Failed to post bot");
    } finally {
      setLoading(false);
    }
  };

  const sidebarLinks = [
    { label: "Profile", href: "/admin/profile" },
    { label: "Notifications", href: "/admin/notifications" },
    { label: "News", href: "/admin/news" },
    { label: "Bots", href: "/admin/bots" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 p-6 transform transition-transform duration-500 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neon-green">ADMIN</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="space-y-4">
          {sidebarLinks.map((link) => (
            <div
              key={link.href}
              onClick={() => router.push(link.href)}
              className="cursor-pointer hover:shadow-neon-green font-medium py-2 px-2 rounded transition-all"
            >
              {link.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6">
        {/* Mobile Hamburger */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button className="text-[#00FFFF]" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-8 h-8" />
          </button>
          <span className="font-bold text-[#00FFFF] text-xl">ADMIN DASHBOARD</span>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center justify-center bg-gray-900 p-6 rounded-2xl mb-6 shadow-[0_0_20px_#00FFFF]/20">
          <h1 className="text-3xl font-bold text-neon-green mb-2">Post New Bot</h1>
          <Image
            src="/IMG-20250813-WA0001.jpg"
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full border-2 border-neon-green mt-4"
          />
        </div>

        {/* Bot Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          <div>
            <label>Bot Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              name="botImage"
              onChange={handleChange}
              className="w-full mt-1"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Bot Name *"
              name="botName"
              value={form.botName}
              onChange={handleChange}
              className="input-style"
              required
            />
            <input
              type="text"
              placeholder="Developer Name *"
              name="developerName"
              value={form.developerName}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Bot Version"
            name="botVersion"
            value={form.botVersion}
            onChange={handleChange}
            className="input-style"
          />

          <textarea
            placeholder="Bot Description *"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-style"
            required
          />

          <div>
            <label>Zip File *</label>
            <input
              type="file"
              accept=".zip"
              name="zipFile"
              onChange={handleChange}
              className="w-full mt-1"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="GitHub URL (Optional)"
              name="githubUrl"
              value={form.githubUrl}
              onChange={handleChange}
              className="input-style"
            />
            <input
              type="url"
              placeholder="Developer Site (Optional)"
              name="developerSite"
              value={form.developerSite}
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div>
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input-style"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div>
            <label>Hostings</label>
            <div className="grid sm:grid-cols-2 gap-2 mt-1">
              {hostingsOptions.map((h) => (
                <label key={h} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="deploymentHosts"
                    value={h}
                    checked={form.deploymentHosts.includes(h)}
                    onChange={handleChange}
                    className="accent-[#00FF9F]"
                  />
                  <span>{h}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded-lg hover:bg-[#00cc80] transition transform hover:scale-105 shadow-[0_0_20px_#00FF9F]"
          >
            {loading ? "Posting..." : "Post Bot"}
          </button>
        </form>
      </main>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background-color: rgba(0, 0, 0, 0.6);
          border: 1px solid #374151;
          color: white;
          outline: none;
          margin-top: 0.25rem;
        }
        .input-style:focus {
          border-color: #00FF9F;
          box-shadow: 0 0 0 2px #00ff9f40;
        }
      `}</style>
    </div>
  );
}

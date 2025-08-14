import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function AdminBots() {
  const [formData, setFormData] = useState({
    botName: "",
    developerName: "",
    botVersion: "",
    description: "",
    githubUrl: "",
    developerSite: "",
    postedBy: "",
    status: "online",
    hostings: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const hostingOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own Hosting",
  ];

  // Upload helper
  const uploadFile = async (file, bucket) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      let imageUrl = "";
      let zipUrl = "";

      if (imageFile) {
        toast.loading("Uploading image...");
        imageUrl = await uploadFile(imageFile, "bot-image");
        console.log("Image URL:", imageUrl);
        toast.dismiss();
        toast.success("Image uploaded");
      }

      if (zipFile) {
        toast.loading("Uploading zip...");
        zipUrl = await uploadFile(zipFile, "bot-zip");
        console.log("Zip URL:", zipUrl);
        toast.dismiss();
        toast.success("Zip uploaded");
      }

      const { data, error } = await supabase
        .from("bots")
        .insert([
          {
            name: formData.botName,
            developer_name: formData.developerName,
            bot_version: formData.botVersion,
            description: formData.description,
            github_url: formData.githubUrl,
            developer_site: formData.developerSite,
            posted_by: formData.postedBy,
            status: formData.status,
            deployment_hosts: formData.hostings,
            image_url: imageUrl,
            zip_file_url: zipUrl,
          },
        ])
        .select();

      console.log("Insert result:", data, error);

      if (error) throw error;

      setSuccessMessage("✅ Bot posted successfully!");
      toast.success("Bot posted successfully!");

      // Reset form
      setFormData({
        botName: "",
        developerName: "",
        botVersion: "",
        description: "",
        githubUrl: "",
        developerSite: "",
        postedBy: "",
        status: "online",
        hostings: [],
      });
      setImageFile(null);
      setZipFile(null);
    } catch (err) {
      console.error("Post error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHostingChange = (hosting) => {
    setFormData((prev) => {
      const exists = prev.hostings.includes(hosting);
      return {
        ...prev,
        hostings: exists
          ? prev.hostings.filter((h) => h !== hosting)
          : [...prev.hostings, hosting],
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-gray-100 shadow-lg rounded-xl">
      <h1 className="text-3xl font-bold mb-6">🚀 Post New Bot</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-700 text-green-100 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bot Name */}
        <input
          type="text"
          name="botName"
          value={formData.botName}
          onChange={handleChange}
          placeholder="Bot Name"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
          required
        />

        {/* Developer Name */}
        <input
          type="text"
          name="developerName"
          value={formData.developerName}
          onChange={handleChange}
          placeholder="Developer Name"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
          required
        />

        {/* Bot Version */}
        <input
          type="text"
          name="botVersion"
          value={formData.botVersion}
          onChange={handleChange}
          placeholder="Bot Version"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
        />

        {/* Description */}
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Bot Description"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
          rows="3"
          required
        />

        {/* GitHub URL */}
        <input
          type="url"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="GitHub URL (optional)"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
        />

        {/* Developer Site */}
        <input
          type="url"
          name="developerSite"
          value={formData.developerSite}
          onChange={handleChange}
          placeholder="Developer Site (optional)"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
        />

        {/* Posted By */}
        <input
          type="text"
          name="postedBy"
          value={formData.postedBy}
          onChange={handleChange}
          placeholder="Posted By"
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
          required
        />

        {/* Status */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-700 bg-gray-800 rounded p-2"
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        {/* Hosting Checkboxes */}
        <div>
          <label className="block font-medium mb-2">Hostings</label>
          <div className="flex flex-wrap gap-4">
            {hostingOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hostings.includes(option)}
                  onChange={() => handleHostingChange(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-2">Bot Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        {/* Zip Upload */}
        <div>
          <label className="block font-medium mb-2">Bot Zip File</label>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Bot"}
        </button>
      </form>
    </div>
  );
    }

import { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle deployment host checkboxes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      let zipUrl = null;

      // Upload image if provided
      if (imageFile) {
        const { data, error } = await supabase.storage
          .from("bots")
          .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("bots")
          .getPublicUrl(data.path);
        imageUrl = publicUrlData.publicUrl;
      }

      // Upload zip if provided
      if (zipFile) {
        const { data, error } = await supabase.storage
          .from("bots")
          .upload(`zips/${Date.now()}_${zipFile.name}`, zipFile);
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("bots")
          .getPublicUrl(data.path);
        zipUrl = publicUrlData.publicUrl;
      }

      // Insert bot data into DB
      const { error: insertError } = await supabase.from("bots").insert([
        {
          name: form.name,
          developer_name: form.developer_name,
          version: form.version || null,
          description: form.description,
          image_url: imageUrl,
          zip_file_url: zipUrl,
          github_url: form.github_url || null,
          developer_site: form.developer_site || null,
          posted_by: form.posted_by,
          status: form.status,
          deployment_hosts: form.deployment_hosts || [],
        },
      ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        toast.error(insertError.message);
        setLoading(false);
        return;
      }

      toast.success("Bot posted successfully!");
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
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const hostingOptions = [
    "Heroku",
    "Render",
    "Replit",
    "Railway",
    "Vercel",
    "Katabump",
    "Own hosting",
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-neon">Post New Bot</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg shadow-lg space-y-4 max-w-3xl mx-auto"
      >
        <input
          type="text"
          name="name"
          placeholder="Bot Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-800"
        />
        <input
          type="text"
          name="developer_name"
          placeholder="Developer Name"
          value={form.developer_name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-800"
        />
        <input
          type="text"
          name="version"
          placeholder="Version"
          value={form.version}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-800"
        ></textarea>

        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          accept="image/*"
          className="w-full p-3 rounded bg-gray-800"
        />
        <input
          type="file"
          onChange={(e) => setZipFile(e.target.files[0])}
          accept=".zip"
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          type="url"
          name="github_url"
          placeholder="GitHub URL"
          value={form.github_url}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        />
        <input
          type="url"
          name="developer_site"
          placeholder="Developer Site"
          value={form.developer_site}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        />
        <input
          type="text"
          name="posted_by"
          placeholder="Posted By"
          value={form.posted_by}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <div className="space-y-2">
          <p className="text-lg font-bold">Deployment Hosts:</p>
          {hostingOptions.map((host) => (
            <label key={host} className="block">
              <input
                type="checkbox"
                name="deployment_hosts"
                value={host}
                checked={form.deployment_hosts.includes(host)}
                onChange={handleChange}
                className="mr-2"
              />
              {host}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-neon text-black font-bold rounded hover:shadow-neon transition"
        >
          {loading ? "Posting..." : "Post Bot"}
        </button>
      </form>
    </div>
  );
}

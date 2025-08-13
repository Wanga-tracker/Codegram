// pages/admin/notifications.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function AdminNotifications() {
  const [activeSection, setActiveSection] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return toast.error(error.message);
    setNotifications(data || []);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message)
      return toast.error("Fill all fields.");

    setLoading(true);
    toast.dismiss();

    const { data, error } = await supabase.from("notifications").insert([
      {
        title: form.title,
        message: form.message,
        created_at: new Date().toISOString(),
        posted_by: "admin", // optional: replace with actual admin id
      },
    ]);

    setLoading(false);

    if (error) return toast.error(error.message);
    toast.success("Notification posted!");

    setForm({ title: "", message: "" });
    fetchNotifications();
  };

  const sections = [
    { key: "profile", label: "Profile" },
    { key: "bots", label: "Bots" },
    { key: "news", label: "News" },
    { key: "notifications", label: "Notifications" },
    { key: "promotions", label: "Promotions" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[#00FF9F] mb-6">Admin Panel</h2>
        <nav className="space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`cursor-pointer hover:text-[#00FF9F] ${
                activeSection === sec.key ? "font-bold text-[#00FF9F]" : ""
              }`}
            >
              {sec.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === "notifications" && (
          <>
            <h1 className="text-3xl font-bold text-[#00FF9F] mb-6">
              Manage Notifications
            </h1>

            {/* Notification Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00FF9F] text-black px-4 py-2 rounded hover:bg-[#00cc80] transition transform hover:scale-105 shadow-[0_0_20px_#00FF9F]"
              >
                {loading ? "Posting..." : "Post Notification"}
              </button>
            </form>

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 bg-gray-800 rounded border border-gray-700"
                >
                  <h3 className="font-bold text-[#9D00FF]">{notif.title}</h3>
                  <p className="text-gray-300">{notif.message}</p>
                  <small className="text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </small>
                  <small className="text-gray-500 block">
                    Posted by: {notif.posted_by || "unknown"}
                  </small>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Placeholder Sections */}
        {activeSection === "profile" && <h1>Profile Section Coming Soon</h1>}
        {activeSection === "bots" && <h1>Bots Section Coming Soon</h1>}
        {activeSection === "news" && <h1>News Section Coming Soon</h1>}
        {activeSection === "promotions" && <h1>Promotions Section Coming Soon</h1>}
      </main>
    </div>
  );
    }

// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.email.trim()) return toast.error("Please enter your email.");
    if (!form.password) return toast.error("Please enter your password.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    toast.dismiss();
    toast.loading("Logging you in...", { id: "loggingIn" });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    toast.remove("loggingIn");

    if (error) {
      toast.error(error.message || "Failed to login. Try again.");
      setLoading(false);
      return;
    }

    toast.success(`Welcome back, ${data.user.user_metadata.full_name || "User"}! 🚀`, {
      style: { background: "#00FF9F", color: "#000", fontWeight: "700" },
    });

    setTimeout(() => router.push("/dashboard"), 1400);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-center mb-4">
          <Image
            src="/IMG-20250812-WA0043.jpg"
            alt="Codegram Logo"
            width={64}
            height={64}
            className="rounded-full border-2 border-[#00FF9F] shadow-[0_0_20px_#00FF9F]/30"
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-1">
          <span className="text-[#9D00FF]">Welcome</span>{" "}
          <span className="text-[#00FF9F]">Back</span>
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Log in to your Codegram account
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input-style"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input-style"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF9F] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#00cc80] transition transform hover:scale-105 shadow-[0_0_20px_#00FF9F]"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background-color: rgba(0, 0, 0, 0.6);
          border: 1px solid #374151;
          color: white;
          outline: none;
        }
        .input-style:focus {
          border-color: #00FF9F;
          box-shadow: 0 0 0 2px #00ff9f40;
        }
      `}</style>
    </div>
  );
}

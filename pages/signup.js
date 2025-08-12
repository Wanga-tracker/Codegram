"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    country: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.agree) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Signup failed: No user ID returned");

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          email: form.email,
          username: form.username,
          full_name: form.full_name,
          country: form.country,
          role: "user",
        },
      ]);

      if (profileError) throw profileError;

      setSuccess("✅ Welcome to Codegram! Have fun 🎉");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("❌ Error signing you up, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black p-4">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onSubmit={handleSignup}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-5"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Codegram Logo"
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-white drop-shadow-md">
          Create Your Account
        </h1>

        {error && <p className="text-red-400 text-center">{error}</p>}
        {success && <p className="text-green-400 text-center">{success}</p>}

        <input
          name="email"
          placeholder="Email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          name="username"
          placeholder="Username"
          required
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <select
          name="country"
          required
          value={form.country}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">Select Country</option>
          <option value="Kenya">Kenya</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="India">India</option>
        </select>

        <label className="flex items-center space-x-2 text-white">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="accent-blue-500"
          />
          <span>I agree to the Terms and Conditions</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:opacity-90 transition-all duration-200"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </motion.form>
    </div>
  );
}

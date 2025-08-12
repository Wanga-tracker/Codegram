"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
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
      // Step 1: Create account in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Signup failed: No user ID returned");

      // Step 2: Insert profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId, // matches auth.users.id
          email: form.email,
          username: form.username,
          name: form.name, // ✅ matches DB column
          country: form.country,
          role: "user",
        },
      ]);

      if (profileError) throw profileError;

      // Step 3: Show success and redirect
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <input
          name="email"
          placeholder="Email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          name="username"
          placeholder="Username"
          required
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <select
          name="country"
          required
          value={form.country}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select Country</option>
          <option value="Kenya">Kenya</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="India">India</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />
          <span>I agree to the Terms and Conditions</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
                                   }

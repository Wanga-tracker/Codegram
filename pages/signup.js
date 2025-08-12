// pages/signup.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

function generateReferral() {
  return "CG" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    agree: false,
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, referralCode: generateReferral() }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return toast.error("Please enter your full name.");
    if (!form.username.trim()) return toast.error("Please choose a username.");
    if (!form.email.trim()) return toast.error("Please enter your email.");
    if (!form.password) return toast.error("Please enter a password.");
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match.");
    if (!form.country) return toast.error("Please select your country.");
    if (!form.agree) return toast.error("You must agree to the Terms & Conditions.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    toast.dismiss();
    toast.loading("Creating your account...", { id: "creating" });

    // 1️⃣ Sign up in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      toast.remove("creating");
      toast.error(signUpError.message || "Error signing you up. Please try again.");
      setLoading(false);
      return;
    }

    // 2️⃣ Get the user ID
    let userId = signUpData?.user?.id;

    // If email confirmation is ON, userId might be null
    if (!userId) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        toast.remove("creating");
        toast.error("Account created. Please check your email to confirm.");
        setLoading(false);
        return;
      }
      userId = sessionData.session.user.id;
    }

    // 3️⃣ Insert into public.profiles
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        country: form.country,
        referral_code: form.referralCode,
        role: "user",
      },
    ]);

    toast.remove("creating");

    if (profileError) {
      toast.error("Account created, but failed to save profile.");
      console.error("Profile insert error:", profileError);
      setLoading(false);
      return;
    }

    // 4️⃣ Success
    toast.success("Welcome to Codegram! 🚀", {
      style: { background: "#00FF9F", color: "#000", fontWeight: "700" },
    });

    setTimeout(() => router.push("/dashboard"), 1400);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl">
        {/* Logo */}
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
          <span className="text-[#9D00FF]">Join</span>{" "}
          <span className="text-[#00FF9F]">Codegram</span>
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Create your account to explore WhatsApp bots & tools
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="input-style" />
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="input-style" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input-style" />

          <div className="grid sm:grid-cols-2 gap-3">
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="input-style" />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="input-style" />
          </div>

          <select name="country" value={form.country} onChange={handleChange} className="input-style">
            <option value="">Select your country</option>
            <option value="Kenya">Kenya</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Nigeria">Nigeria</option>
            <option value="India">India</option>
            <option value="Egypt">Egypt</option>
            <option value="South Africa">South Africa</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex items-center space-x-3">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-4 h-4 accent-[#00FF9F]" />
            <label className="text-gray-300 text-sm">
              I agree to the{" "}
              <span className="text-[#00FF9F] hover:underline cursor-pointer">
                Terms & Conditions
              </span>
            </label>
          </div>

          <input type="hidden" name="referralCode" value={form.referralCode} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF9F] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#00cc80] transition transform hover:scale-105 shadow-[0_0_20px_#00FF9F]"
          >
            {loading ? "Signing Up..." : "Sign Up"}
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

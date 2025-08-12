import { supabase } from "./supabaseClient";

export async function createProfile({ fullName, username, email, country, referralCode }) {
  // Ensure we have a session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error("No active session found after signup.");
  }

  const userId = sessionData.session.user.id;

  // Insert into profiles
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: userId,
      full_name: fullName,
      username,
      email,
      country,
      referral_code: referralCode,
    },
  ]);

  if (profileError) {
    console.error("Profile insert error:", profileError);
    throw new Error("Failed to save profile.");
  }

  return true;
}

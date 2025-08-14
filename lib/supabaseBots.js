import { supabase } from "./supabaseClient";

export const getAllBots = async () => {
  return await supabase.from("bots").select("*").order("created_at", { ascending: false });
};

export const createBot = async (bot) => {
  return await supabase.from("bots").insert(bot);
};

export const deleteBot = async (botId) => {
  return await supabase.from("bots").delete().eq("bot_id", botId);
};

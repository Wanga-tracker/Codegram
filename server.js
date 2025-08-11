// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load env variables
dotenv.config();

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/ping", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Example route to test DB connection
app.get("/api/test-db", async (req, res) => {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

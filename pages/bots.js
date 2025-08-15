import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BotsPage() {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    const fetchBots = async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setBots(data);
    };

    fetchBots();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-12">Available Bots</h1>

      {bots.length === 0 ? (
        <p className="text-center text-gray-400">No bots posted yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {bots.map((bot) => (
            <div
              key={bot.bot_id}
              className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {bot.image_url && (
                <img
                  src={bot.image_url}
                  alt={bot.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 space-y-4">
                <h2 className="text-2xl font-bold">{bot.name}</h2>
                <p className="text-sm text-gray-400">By {bot.developer_name}</p>
                {bot.version && (
                  <p className="text-sm text-gray-500">Version: {bot.version}</p>
                )}
                <p className="text-gray-300">{bot.description}</p>

                {/* Hosting badges */}
                {bot.deployment_hosts?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bot.deployment_hosts.map((host) => (
                      <span
                        key={host}
                        className="px-3 py-1 bg-green-600 text-xs rounded-full"
                      >
                        {host}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status */}
                <p
                  className={`font-bold ${
                    bot.status === "online"
                      ? "text-green-400"
                      : bot.status === "offline"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {bot.status}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {bot.github_url && (
                    <a
                      href={bot.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {bot.zip_file_url && (
                    <a
                      href={bot.zip_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
                    >
                      Download ZIP
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

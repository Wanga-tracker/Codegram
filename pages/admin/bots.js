import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BotForm from "./components/admin/BotForm";
import BotList from "./components/admin/BotList";
import { getAllBots } from "./lib/supabaseBots";

export default function BotsAdmin() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBots = async () => {
    setLoading(true);
    const { data, error } = await getAllBots();
    if (error) {
      toast.error("Failed to load bots");
    } else {
      setBots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBots();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Bots</h1>
      <BotForm onSuccess={loadBots} />
      <BotList bots={bots} loading={loading} onRefresh={loadBots} />
    </div>
  );
}

import { deleteBot } from "./lib/supabaseBots";
import toast from "react-hot-toast";

export default function BotItem({ bot, onRefresh }) {
  const handleDelete = async () => {
    if (!confirm(`Delete ${bot.name}?`)) return;
    const { error } = await deleteBot(bot.bot_id);
    if (error) toast.error("Failed to delete bot");
    else {
      toast.success("Bot deleted");
      onRefresh();
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
      <div>
        <h2 className="font-semibold">{bot.name}</h2>
        <p className="text-sm text-gray-600">{bot.description}</p>
      </div>
      <button onClick={handleDelete} className="btn-danger">Delete</button>
    </div>
  );
  }

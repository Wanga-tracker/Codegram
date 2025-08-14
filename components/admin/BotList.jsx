import BotItem from "./BotItem";

export default function BotList({ bots, loading, onRefresh }) {
  if (loading) return <p>Loading bots...</p>;
  if (!bots.length) return <p>No bots found</p>;

  return (
    <div className="space-y-3">
      {bots.map(bot => (
        <BotItem key={bot.bot_id} bot={bot} onRefresh={onRefresh} />
      ))}
    </div>
  );
      }

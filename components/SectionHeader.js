export default function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold text-neon-purple drop-shadow-glow">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
    }

import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src="/IMG-20250812-WA0043.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold">
            <span className="text-[#00FF9F]">Code</span>
            <span className="text-[#9D00FF]">Gram</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <a
            href="/signup"
            className="px-5 py-2 rounded-lg font-semibold bg-[#00FF9F] text-black hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#00FF9F]/50"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-5 py-2 rounded-lg font-semibold bg-[#9D00FF] text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#9D00FF]/50"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-20 px-4">
        <h2 className="text-5xl font-extrabold mb-4">
          <span className="text-[#9D00FF]">Next-Gen</span> Tech Hub
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explore the latest WhatsApp bots, VPS servers, hosting tools, and more — built for devs who want to stay ahead.
        </p>
      </header>

      {/* Cards Section */}
      <section className="grid gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto pb-20">
        {[
          "Find latest Whatsapp bot",
          "Find latest VPS servers",
          "Get news on panel",
          "Create and deploy static websites",
          "Know more about Whatsapp bot",
          "Exclusive tech insights"
        ].map((title, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-[#00FF9F]/30"
          >
            <h3 className="text-xl font-semibold mb-3 text-[#00FF9F]">{title}</h3>
            <p className="text-gray-400 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Stay up-to-date with our curated tech updates.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
    }

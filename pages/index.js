import Image from "next/image";

export default function Home() {
  const cards = [
    {
      title: "Find Latest WhatsApp Bot",
      desc: "Discover powerful and updated WhatsApp bots for automation, marketing, and support."
    },
    {
      title: "Find Latest VPS Servers",
      desc: "Get access to reliable and high-speed VPS servers for your hosting needs."
    },
    {
      title: "Get News on Panel",
      desc: "Stay updated with the latest features, updates, and tools in our control panel."
    },
    {
      title: "Create & Deploy Static Websites",
      desc: "Build and launch your static websites instantly with modern tools."
    },
    {
      title: "Know More About WhatsApp Bot",
      desc: "Learn how WhatsApp bots work, from setup to advanced integrations."
    },
    {
      title: "Exclusive Tech Insights",
      desc: "Get tips, tricks, and guides to help you stay ahead in the tech world."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
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
      </nav>

      {/* Hero Section */}
      <header className="text-center py-16 px-4">
        <h2 className="text-5xl font-extrabold mb-4">
          <span className="text-[#9D00FF]">Next-Gen</span> Tech Hub
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Explore the latest WhatsApp bots, VPS servers, hosting tools, and more — built for devs who want to stay ahead.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/signup"
            className="px-6 py-3 rounded-lg font-semibold bg-[#00FF9F] text-black hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#00FF9F]/50 hover:shadow-[#00FF9F]/70"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-lg font-semibold bg-[#9D00FF] text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#9D00FF]/50 hover:shadow-[#9D00FF]/70"
          >
            Login
          </a>
        </div>
      </header>

      {/* Cards Section */}
      <section className="grid gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto pb-20">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00FF9F]/30"
          >
            <h3 className="text-xl font-semibold mb-3 text-[#00FF9F]">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CodeGram. Built with 💻 & ⚡ by innovators for innovators.
      </footer>
    </div>
  );
    }

// pages/index.js
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Find latest WhatsApp bots",
      desc: "Browse, preview, and download the freshest WhatsApp bot projects — curated and ranked by the community.",
      icon: "🤖",
      href: "/bots"
    },
    {
      title: "Find latest VPS servers",
      desc: "Guides and links to free/dev-friendly VPS options for deploying your bots (Heroku, Railway, Render, etc.).",
      icon: "🖥️",
      href: "/servers"
    },
    {
      title: "Get news on panel",
      desc: "Stay informed with a dedicated news panel for bot updates, changelogs, and security notices.",
      icon: "📰",
      href: "/news"
    },
    {
      title: "Create & deploy static sites",
      desc: "Deploy static docs, bot demos, and landing pages directly from the platform in the future.",
      icon: "🚀",
      href: "/deploy"
    },
    {
      title: "Learn about WhatsApp bots",
      desc: "Step-by-step tutorials and quickstart guides so anyone can build and deploy a bot.",
      icon: "📚",
      href: "/tutorials"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        <Navbar />

        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-600 to-purple-600 text-white py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Codegram
            </h1>
            <p className="mt-4 text-lg md:text-2xl max-w-3xl mx-auto opacity-90">
              Discover, deploy, and level-up your bots. Built for devs, powered by
              community — scaled for the future.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/signup">
                <a className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl shadow hover:bg-yellow-300">
                  Get Started
                </a>
              </Link>
              <Link href="/bots">
                <a className="px-6 py-3 border border-white/30 rounded-xl hover:bg-white/10">
                  Browse Bots
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">What you can do</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <Card key={f.title} title={f.title} desc={f.desc} href={f.href} icon={f.icon} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Want custom bot support, automated deployments, or a developer panel?
                Create an account and join the Codegram community — we’re building this
                together.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t mt-12">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-600 flex justify-between items-center">
            <div>© {new Date().getFullYear()} Codegram</div>
            <div>
              <Link href="/news"><a className="hover:underline">News</a></Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
    }

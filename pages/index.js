// pages/index.js
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="text-center pt-24 px-6">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to <span className="text-neon">Codegram 🚀</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover, deploy, and level-up your bots. Built for devs, powered by community — scaled for the future.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="/signup"
            className="px-6 py-3 bg-neon rounded-lg font-semibold text-black hover:shadow-neon transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold text-white hover:bg-gray-700 transition"
          >
            Login
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 mt-16 max-w-6xl mx-auto">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-neon transition"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🤖',
    title: 'Find latest WhatsApp bots',
    description:
      'Browse, preview, and download the freshest WhatsApp bot projects — curated and ranked by the community.',
  },
  {
    icon: '🖥️',
    title: 'Find latest VPS servers',
    description:
      'Guides and links to free/dev-friendly VPS options for deploying your bots (Heroku, Railway, Render, etc.).',
  },
  {
    icon: '📰',
    title: 'Get news on panel',
    description:
      'Stay informed with a dedicated news panel for bot updates, changelogs, and security notices.',
  },
  {
    icon: '🌐',
    title: 'Create & deploy websites',
    description:
      'Launch fast static websites with optimized performance, security, and scalability.',
  },
  {
    icon: '📚',
    title: 'Learn more about bots',
    description:
      'Get deep insights into WhatsApp bot building, scaling, and monetization.',
  },
]

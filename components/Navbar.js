import Link from "next/link";
import Image from "next/image";
import { Menu, X, Code2 } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="nav-glass sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* Left: Hamburger (mobile) */}
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="md:hidden mr-2 p-2 rounded-lg hover:bg-white/10 transition"
          >
            <Menu size={22} />
          </button>

          {/* Center: Brand */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link href="/" className="group flex items-center gap-3">
              <Image
                src="/IMG-20250812-WA0043.jpg"
                alt="Codegram Logo"
                width={36}
                height={36}
                className="rounded-full border-2 border-neon-purple drop-shadow-glow"
                priority
              />
              <span className="hidden md:inline text-xl font-extrabold tracking-wide text-neon-purple">
                CODEGRAM
              </span>
              <span className="sr-only">Codegram</span>
            </Link>
          </div>

          {/* Right: Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-neon-cyan transition relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-neon-cyan after:transition-all">
              Home
            </Link>
            <Link href="/login" className="hover:text-neon-cyan transition relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-neon-cyan after:transition-all">
              Login
            </Link>
            <Link href="/signup" className="btn-neon">Sign Up</Link>
            <Link href="/admin/code" className="btn-ghost gap-2">
              <Code2 size={18} /> {"</>"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-[#0b0b0f]/95 border-r border-white/10 p-4 animate-slide-in ${open ? "translate-x-0" : "-translate-x-full"} transition-transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image
                src="/IMG-20250812-WA0043.jpg"
                alt="Codegram Logo"
                width={32}
                height={32}
                className="rounded-full border-2 border-neon-purple"
              />
              <span className="text-lg font-bold text-neon-purple">CODEGRAM</span>
            </div>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="btn-ghost">Home</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">Login</Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="btn-neon">Sign Up</Link>
            <Link href="/admin/code" onClick={() => setOpen(false)} className="btn-ghost gap-2">
              <Code2 size={18} /> {"</> Code"}
            </Link>
          </nav>

          <div className="mt-6 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-sm text-gray-300">
              Built by <span className="text-neon-green font-semibold">Tracker Wanga</span>.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
    }

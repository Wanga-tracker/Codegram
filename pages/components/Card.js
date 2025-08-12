// components/Card.js
import React from "react";
import Link from "next/link";

export default function Card({ title, desc, ctaText = "Learn more", href = "#" , icon}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-lg">
          <span className="text-2xl">{icon || "🤖"}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{desc}</p>
          <div className="mt-4">
            <Link href={href}>
              <a className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500">
                {ctaText}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
    }

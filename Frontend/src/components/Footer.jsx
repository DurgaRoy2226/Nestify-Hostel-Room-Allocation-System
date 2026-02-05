import React from "react";

const Footer = () => {
  return (
    <footer className="relative mt-16">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-red-500/20 blur-3xl opacity-60"></div>

      <div className="relative glass-card rounded-t-3xl px-8 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-gray-300">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Nestify
            </h2>
            <p className="mt-2 text-gray-400">
              Find your perfect nest. Smart hostel room allocation with real-time management.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} Nestify • All rights reserved
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li className="hover:text-white transition">Dashboard</li>
              <li className="hover:text-white transition">Rooms</li>
              <li className="hover:text-white transition">Students</li>
              <li className="hover:text-white transition">Settings</li>
            </ul>
          </div>

          {/* Status / Meta */}
          <div>
            <h3 className="text-white font-semibold mb-3">System</h3>
            <div className="space-y-2 text-gray-400">
              <p>⚡ Real-time Updates</p>
              <p>🔐 JWT Secured</p>
              <p>📡 Socket.IO Connected</p>
              <p>🧠 MERN Stack</p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>Built with ❤️ using MERN Stack</p>
          <p className="mt-2 md:mt-0">
            Designed by <span className="text-white">Nestify UI Lab</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';

/**
 * AnimatedWifiBackground
 * 
 * Creates a sophisticated, slow, continuous animated Wi-Fi & network-wave background.
 * Features:
 * - Expanding concentric translucent Wi-Fi arcs
 * - Multiple transmission nodes simulating RF signal propagation
 * - Subdued, non-distracting opacity tuned for optimal readability
 * - GPU-accelerated SVG & CSS transforms with zero pointer event interference
 */
export const AnimatedWifiBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#030712]"
    >
      {/* Ambient gradient glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]" />
      <div className="absolute -bottom-40 left-1/4 w-[700px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />

      {/* Cybernetic Tech Dot Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(20, 184, 166, 0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Primary Center-Bottom Wi-Fi Transmitter Symbol & Radiating Waves */}
      <div className="absolute left-1/2 bottom-[-80px] -translate-x-1/2 w-[1100px] h-[750px] opacity-75">
        <svg
          viewBox="0 0 1000 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="wifiGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="wifiGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wi-Fi Beacon Dot (Base Origin) */}
          <g className="animate-pulse" style={{ animationDuration: '4s' }}>
            <circle cx="500" cy="620" r="12" fill="#14b8a6" filter="url(#neonGlow)" />
            <circle cx="500" cy="620" r="24" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
            <circle cx="500" cy="620" r="40" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
          </g>

          {/* Concentric Wi-Fi Signal Waves Expanding Outward */}
          {/* Wave 1: Innermost arc */}
          <path
            d="M 410 545 A 120 120 0 0 1 590 545"
            stroke="url(#wifiGrad1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="wifi-wave wifi-wave-1"
          />

          {/* Wave 2 */}
          <path
            d="M 335 470 A 220 220 0 0 1 665 470"
            stroke="url(#wifiGrad2)"
            strokeWidth="3"
            strokeLinecap="round"
            className="wifi-wave wifi-wave-2"
          />

          {/* Wave 3 */}
          <path
            d="M 260 395 A 320 320 0 0 1 740 395"
            stroke="url(#wifiGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="wifi-wave wifi-wave-3"
          />

          {/* Wave 4 */}
          <path
            d="M 185 320 A 420 420 0 0 1 815 320"
            stroke="url(#wifiGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="wifi-wave wifi-wave-4"
          />

          {/* Wave 5 */}
          <path
            d="M 110 245 A 520 520 0 0 1 890 245"
            stroke="url(#wifiGrad1)"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="wifi-wave wifi-wave-5"
          />

          {/* Wave 6: Outermost massive arc */}
          <path
            d="M 35 170 A 620 620 0 0 1 965 170"
            stroke="url(#wifiGrad2)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="wifi-wave wifi-wave-6"
          />

          {/* Ethereal RF Signal Guide Lines */}
          <line x1="500" y1="620" x2="250" y2="200" stroke="#14b8a6" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.12" />
          <line x1="500" y1="620" x2="500" y2="100" stroke="#06b6d4" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.15" />
          <line x1="500" y1="620" x2="750" y2="200" stroke="#14b8a6" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.12" />
        </svg>
      </div>

      {/* Secondary Top-Right Auxiliary Wi-Fi Propagation Node */}
      <div className="absolute -top-16 -right-16 w-[550px] h-[550px] opacity-40">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform rotate-180"
        >
          {/* Origin */}
          <circle cx="250" cy="460" r="6" fill="#06b6d4" opacity="0.7" />

          {/* Arcs expanding downward-left */}
          <path
            d="M 200 420 A 70 70 0 0 1 300 420"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeLinecap="round"
            className="wifi-wave-secondary wifi-wave-1"
          />
          <path
            d="M 150 380 A 130 130 0 0 1 350 380"
            stroke="#06b6d4"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="wifi-wave-secondary wifi-wave-2"
          />
          <path
            d="M 100 340 A 190 190 0 0 1 400 340"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="wifi-wave-secondary wifi-wave-3"
          />
          <path
            d="M 50 300 A 250 250 0 0 1 450 300"
            stroke="#14b8a6"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            className="wifi-wave-secondary wifi-wave-4"
          />
        </svg>
      </div>

      {/* Subtle Floating Network Telemetry Badges in Background */}
      <div className="absolute top-28 left-10 hidden xl:flex items-center gap-2 text-[10px] font-mono text-teal-400/25 tracking-widest uppercase pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400/40 animate-ping" />
        <span>RF BAND: 5.8 GHz // CH 149 (80 MHz)</span>
      </div>
      <div className="absolute top-44 right-16 hidden xl:flex items-center gap-2 text-[10px] font-mono text-cyan-400/25 tracking-widest uppercase pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" />
        <span>BEACON INTERVAL: 100 TU // 802.11ax MIMO</span>
      </div>
    </div>
  );
};

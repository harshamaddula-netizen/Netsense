import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AnimatedWifiBackground } from '../common/AnimatedWifiBackground';
import { NetSenseAssistantModal } from '../../features/ai/NetSenseAssistantModal';
import { Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 antialiased selection:bg-teal-500 selection:text-white relative overflow-x-hidden">
      {/* Sophisticated Animated Wi-Fi / Radio Network Background */}
      <AnimatedWifiBackground />

      {/* Top Navbar */}
      <div className="relative z-20">
        <Navbar onOpenAssistant={() => setAssistantOpen(true)} />
      </div>

      {/* Body with Sidebar and Main Content */}
      <div className="relative z-10 flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating NetSense AI Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-semibold text-xs shadow-[0_0_25px_rgba(20,184,166,0.35)] hover:scale-105 active:scale-95 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          <span>Ask NetSense AI</span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <NetSenseAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
};

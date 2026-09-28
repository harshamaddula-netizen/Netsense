import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black font-mono text-white">404 - Zone Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested network endpoint or campus location does not exist in the routing table.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-md shadow-teal-500/10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Campus Portal</span>
      </Link>
    </div>
  );
};

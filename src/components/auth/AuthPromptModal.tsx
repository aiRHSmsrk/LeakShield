import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthPrompt } from '../../context/AuthPromptContext';
import { Link } from 'react-router';

export default function AuthPromptModal(){
  const { showPrompt, dismiss, user } = useAuthPrompt();
  const [closed, setClosed] = useState(false);
  // Lock scroll when modal open
  useEffect(()=>{
    if(showPrompt && !user && !closed){
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  },[showPrompt, user, closed]);

  if(!showPrompt || user || closed) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Lighter, Apple-style frosted overlay with minimal blur */}
      <div
        className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-saturate-150 backdrop-blur-[1.5px] supports-[backdrop-filter]:backdrop-blur-[1.5px]"
        onClick={()=>{ setClosed(true); dismiss();}}
      />
      {/* Subtle highlights to enhance glass effect (non-interactive) */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_220px_at_20%_10%,rgba(255,255,255,0.22),transparent),radial-gradient(480px_200px_at_80%_90%,rgba(59,130,246,0.15),transparent)]" />
      {/* Glassy modal panel with minimal blur */}
      <div className="relative w-full max-w-md rounded-2xl bg-white/55 dark:bg-gray-900/40 backdrop-blur-[1px] border border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
        <button onClick={()=>{ setClosed(true); dismiss();}} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close">✕</button>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create a free account</h3>
          <p className="text-sm text-gray-700/90 dark:text-gray-300 mb-4">Save preferences, track remediation progress and unlock full dashboard features.</p>
          <div className="space-y-3">
            <Link to="/signup" className="block w-full text-center rounded-lg bg-blue-600 text-white font-medium text-sm py-2.5 hover:bg-blue-700 shadow-theme-xs">Sign up with Google</Link>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

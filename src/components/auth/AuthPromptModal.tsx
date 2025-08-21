import { useState } from 'react';
import { useAuthPrompt } from '../../context/AuthPromptContext';
import { Link } from 'react-router';

export default function AuthPromptModal(){
  const { showPrompt, dismiss, user } = useAuthPrompt();
  const [closed, setClosed] = useState(false);
  if(!showPrompt || user || closed) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>{ setClosed(true); dismiss();}} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <button onClick={()=>{ setClosed(true); dismiss();}} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">✕</button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Create a free account</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Save preferences, track remediation progress and unlock full dashboard features.</p>
        <div className="space-y-3">
          <Link to="/signup" className="block w-full text-center rounded-lg bg-blue-600 text-white font-medium text-sm py-2.5 hover:bg-blue-700">Sign up with Google</Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

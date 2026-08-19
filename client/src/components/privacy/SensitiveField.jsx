// SensitiveField: click-to-reveal for diagnosis, prescription, notes
// - If restricted (staff): shows "Restricted" 
// - If authorized: shows masked with [Reveal] button
import { useState } from 'react';

export default function SensitiveField({ label, value, restricted = false }) {
  const [revealed, setRevealed] = useState(false);

  if (restricted || value === null || value === undefined) {
    return (
      <div>
        <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
        <span className="text-sm text-gray-400 italic">Restricted</span>
      </div>
    );
  }

  return (
    <div>
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        {revealed ? (
          <>
            <span className="text-sm text-gray-800">{value}</span>
            <button
              onClick={() => setRevealed(false)}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Hide
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-400 font-mono tracking-wider select-none">
              ••••••••••••••••
            </span>
            <button
              onClick={() => setRevealed(true)}
              className="text-xs hover:opacity-80 underline transition-colors font-medium"
              style={{ color: '#3D7068' }}
            >
              Reveal
            </button>
          </>
        )}
      </div>
    </div>
  );
}

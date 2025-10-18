import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface NoteBoardProps {
  onDismiss: () => void;
}

const NoteBoard: React.FC<NoteBoardProps> = ({ onDismiss }) => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/50 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-200 p-4 rounded-lg shadow-md mb-6 relative">
      <button 
        onClick={onDismiss} 
        className="absolute top-2 right-2 p-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100"
        aria-label="Dismiss note board"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
      <h3 className="font-bold text-lg mb-2">Welcome to SpendWise!</h3>
      <p className="text-sm">
        Here are a few tips to get you started:
      </p>
      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
        <li>Click the <span className="font-bold">+ Add</span> button to log a new expense or scan a bill.</li>
        <li>Use the <span className="font-bold">Gear Icon</span> to set your currency and spending limits.</li>
        <li>Your data is saved locally on this device for your privacy.</li>
      </ul>
    </div>
  );
};

export default NoteBoard;
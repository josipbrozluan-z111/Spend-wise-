import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Transaction, Currency, ScannedBillData } from '../types';
import { scanBill } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';

interface AddTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  baseCurrency: Currency;
  exchangeRate: number;
}

const CATEGORIES = ["Groceries", "Utilities", "Transport", "Entertainment", "Dining", "Shopping", "Health", "Other"];

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, baseCurrency, exchangeRate }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<Currency>(baseCurrency);
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function to revoke object URL on unmount
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setError('');
    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRemoveImage = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  const handleScanClick = async () => {
    if (!imageFile) {
        setError("No image selected to scan.");
        return;
    }

    setIsScanning(true);
    setError('');

    try {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const scannedData = await scanBill(base64String, imageFile.type);
            setIsScanning(false);
            if (scannedData) {
                populateFormWithScannedData(scannedData);
                handleRemoveImage();
            } else {
                setError('AI could not read the bill. Please try another image or enter manually.');
            }
        };
        reader.onerror = () => {
            setError('Failed to read file.');
            setIsScanning(false);
        }
    } catch (e) {
        setError('An error occurred during scanning.');
        setIsScanning(false);
    }
  };
  
  const populateFormWithScannedData = useCallback((data: ScannedBillData) => {
    setDescription(data.items.map(i => i.name).join(', ') || 'Scanned Bill');
    setAmount(data.totalAmount.toString());
    
    const scannedDate = new Date(data.date);
    if (!isNaN(scannedDate.getTime())) {
        setDate(data.date);
    } else {
        setDate(new Date().toISOString().split('T')[0]);
    }

    if (CATEGORIES.includes(data.category)) {
      setCategory(data.category);
    } else {
      setCategory("Other");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
      setError('Please fill all fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    onAddTransaction({
      description,
      amount: numericAmount,
      date,
      currency,
      category
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Add Transaction</h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Close">
            <CloseIcon className="h-6 w-6" />
          </button>
          
          {!imagePreviewUrl ? (
            <div className="text-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Scan a Bill with AI</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Capture a receipt with your camera or upload an image to automatically fill the form.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all">
                        <CameraIcon className="h-5 w-5 mr-2"/> Take Photo
                    </button>
                    <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex-1 flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all">
                        <UploadIcon className="h-5 w-5 mr-2"/> Upload Image
                    </button>
                </div>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                    <img src={imagePreviewUrl} alt="Bill preview" className="w-full max-h-60 object-contain bg-slate-100 dark:bg-slate-700" />
                    {isScanning && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-2"></div>
                            <span>Scanning...</span>
                        </div>
                    )}
                    <button onClick={handleRemoveImage} disabled={isScanning} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-75 transition">
                        <CloseIcon className="h-5 w-5"/>
                    </button>
                </div>
                <button type="button" onClick={handleScanClick} disabled={isScanning} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-all disabled:bg-emerald-300 disabled:cursor-not-allowed">
                    {isScanning ? 'Processing...' : 'Scan This Image'}
                </button>
            </div>
          )}

          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageSelect} className="hidden" />
          <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageSelect} className="hidden" />

          {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm font-medium">OR ENTER MANUALLY</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
            </div>
            <div className="flex space-x-4">
              <div className="flex-grow">
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                <select id="currency" value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="mt-1 block w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                  <option value="EUR">EUR</option>
                  <option value="VND">VND</option>
                </select>
              </div>
            </div>
             <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
            </div>
            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-all">Add Expense</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
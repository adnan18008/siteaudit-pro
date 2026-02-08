import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';

interface ProModalProps {
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ onClose }) => {
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('monthly');
  const upiId = "jigyasupatel7380@okicici";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto">
        {/* Left Side - Value Prop */}
        <div className="md:w-2/5 bg-gradient-to-br from-brand-600 to-indigo-700 p-6 sm:p-8 text-white flex flex-col justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Upgrade to Pro</h2>
            <p className="text-brand-100 mb-6 sm:mb-8 text-sm sm:text-base">Unlock deep insights, competitor analysis, and unlimited audits.</p>
            <ul className="space-y-3 sm:space-y-4">
              {[
                "Unlimited Website Audits",
                "Advanced SEO Recommendations",
                "Competitor Keyword Gap Analysis",
                "Historical Data (5 Years)",
                "PDF Export Reports",
                "Priority Support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 hidden md:block">
            <p className="text-xs text-brand-100 opacity-80">Trusted by 10,000+ marketers worldwide.</p>
          </div>
        </div>

        {/* Right Side - Payment & Plans */}
        <div className="md:w-3/5 p-6 sm:p-8 overflow-y-auto relative bg-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
            <X size={24} />
          </button>

          <h3 className="text-xl font-bold text-slate-900 mb-6">Select your plan</h3>
          
          <div className="flex bg-slate-100 p-1 rounded-lg mb-8 w-fit">
            <button 
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${activePlan === 'monthly' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
              onClick={() => setActivePlan('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${activePlan === 'yearly' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
              onClick={() => setActivePlan('yearly')}
            >
              Yearly <span className="text-[10px] text-green-600 bg-green-100 px-1 rounded ml-1">SAVE 20%</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${activePlan === 'monthly' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`} onClick={() => setActivePlan('monthly')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900 text-sm">Pro Monthly</span>
                {activePlan === 'monthly' && <div className="h-4 w-4 rounded-full bg-brand-500 flex-shrink-0"></div>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹2,499<span className="text-sm text-slate-500 font-normal">/mo</span></div>
            </div>
             <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${activePlan === 'yearly' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`} onClick={() => setActivePlan('yearly')}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900 text-sm">Pro Yearly</span>
                {activePlan === 'yearly' && <div className="h-4 w-4 rounded-full bg-brand-500 flex-shrink-0"></div>}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹24,999<span className="text-sm text-slate-500 font-normal">/yr</span></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Payment Method (UPI)</h4>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 w-full flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">UPI ID</p>
                  <p className="font-mono text-slate-900 font-medium truncate text-sm sm:text-base">{upiId}</p>
                </div>
                <button onClick={copyToClipboard} className="text-brand-600 hover:bg-brand-50 p-2 rounded-md transition-colors flex-shrink-0">
                  <Copy size={20} />
                </button>
              </div>
              
              <div className="text-center hidden sm:block">
                <p className="text-sm text-slate-600 mb-2">Scan to pay securely via any UPI App</p>
                {/* Simulated QR Code placeholder */}
                <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xs text-slate-400">QR Code</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 sm:py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98]">
            Complete Payment
          </button>
          <p className="text-center text-xs text-slate-400 mt-4 pb-2">Secure payment processing. You will receive an invoice via email.</p>
        </div>
      </div>
    </div>
  );
};
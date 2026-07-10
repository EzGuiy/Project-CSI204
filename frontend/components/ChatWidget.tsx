'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{
            animation: 'chatSlideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                💬
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">แชทกับเรา</h3>
                <p className="text-slate-400 text-xs">SolarTech Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Body - Coming Soon */}
          <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🛠️</span>
            </div>
            <h4 className="text-slate-800 font-bold text-base mb-2">
              รอเปิดระบบเร็วๆ นี้
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[220px]">
              ระบบแชทสำหรับติดต่อแอดมินและผู้ขาย กำลังอยู่ระหว่างการพัฒนา
            </p>

            {/* Decorative animated dots */}
            <div className="flex gap-1.5 mt-5">
              <span
                className="w-2 h-2 bg-blue-400 rounded-full"
                style={{ animation: 'chatBounce 1.4s infinite ease-in-out', animationDelay: '0s' }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full"
                style={{ animation: 'chatBounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }}
              />
              <span
                className="w-2 h-2 bg-blue-400 rounded-full"
                style={{ animation: 'chatBounce 1.4s infinite ease-in-out', animationDelay: '0.4s' }}
              />
            </div>
          </div>

          {/* Footer (disabled input) */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 bg-slate-200 text-slate-400 px-4 py-2.5 rounded-lg text-sm cursor-not-allowed placeholder:text-slate-400"
              />
              <button
                disabled
                className="bg-slate-300 text-slate-400 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
              >
                ส่ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative"
        style={{
          animation: 'chatPulse 3s infinite',
        }}
        title="แชทกับเรา"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes chatPulse {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          }
          50% {
            box-shadow: 0 4px 25px rgba(37, 99, 235, 0.5);
          }
        }
      `}</style>
    </div>
  );
}

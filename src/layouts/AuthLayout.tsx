import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {children}
        </div>
        <p className="text-center text-gray-500 text-xs mt-6">2026 BusLink. All rights reserved.</p>
      </div>
    </div>
  );
}

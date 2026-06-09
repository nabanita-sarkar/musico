import { type ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col gap-4 border border-slate-200 rounded-xl p-6 bg-white/90 w-96 drop-shadow-2xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

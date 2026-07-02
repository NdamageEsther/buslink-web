import { ReactNode } from "react";
import Navbar from "../components/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-[73px]">
        {children}
      </div>
    </div>
  );
}

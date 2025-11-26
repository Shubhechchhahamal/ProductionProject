import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 
      bg-gradient-to-b from-[#FAF8F6] to-[#F1ECE7] text-[#4A4A4A] px-4">

      {/* Logo */}
      <img
        src="/homeaway-logo.png"
        alt="HomeAway"
        className="w-[420px] md:w-[480px] lg:w-[520px] mb-12 drop-shadow-sm"
      />

      {/* Image Row */}
      <div className="flex gap-12 mb-12">
        <img
          src="/students1.jpg"
          className="w-56 h-56 md:w-60 md:h-60 rounded-xl object-cover 
          shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 transition"
        />

        <img
          src="/students2.jpg"
          className="w-56 h-56 md:w-60 md:h-60 rounded-xl object-cover 
          shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 transition -translate-y-1"
        />

        <img
          src="/students3.jpg"
          className="w-56 h-56 md:w-60 md:h-60 rounded-xl object-cover 
          shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 transition"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link
          to="/login"
          className="px-10 py-3 bg-[#E8E2DC] hover:bg-[#DED7D0] 
          text-[#4A4A4A] rounded-xl text-lg font-medium shadow 
          transition"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="px-10 py-3 bg-[#E8E2DC] hover:bg-[#DED7D0] 
          text-[#4A4A4A] rounded-xl text-lg font-medium shadow 
          transition"
        >
          Register
        </Link>
      </div>

    </div>
  );
}

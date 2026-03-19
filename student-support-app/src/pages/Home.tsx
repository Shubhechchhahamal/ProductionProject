import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 px-4
      bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] text-gray-800">

      {/* Logo */}
      <img
        src="/homeaway-logo.png"
        alt="HomeAway Logo"
        className="w-[300px] sm:w-[380px] md:w-[460px] mb-10 drop-shadow-md"
      />

      {/* Tagline */}
      <p className="text-lg text-gray-600 mb-10 text-center max-w-xl">
        A safe space for international students to connect, share, and support each other 💜
      </p>

      {/* Images */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">

        <img
          src="/students1.jpg"
          alt="Students"
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover 
          shadow-md hover:scale-105 transition"
        />

        <img
          src="/students2.jpg"
          alt="Students"
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover 
          shadow-md hover:scale-105 transition -translate-y-2"
        />

        <img
          src="/students3.jpg"
          alt="Students"
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover 
          shadow-md hover:scale-105 transition"
        />

      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">

        <Link
          to="/login"
          className="px-8 py-3 bg-purple-500 text-white rounded-xl text-lg 
          font-medium shadow hover:bg-purple-600 transition text-center"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="px-8 py-3 bg-white text-purple-500 border border-purple-200 
          rounded-xl text-lg font-medium shadow hover:bg-purple-50 transition text-center"
        >
          Register
        </Link>

      </div>

    </div>
  );
}
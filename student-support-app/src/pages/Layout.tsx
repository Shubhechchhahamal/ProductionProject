import { Link } from "react-router-dom";

export default function Layout({ children }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      {/* NAVBAR */}
      <div className="glass-effect flex items-center justify-between px-8 py-4 shadow-sm">

        <div className="flex items-center gap-6">
          <Link to="/home" className="text-xl font-bold gradient-text">
            🏡 HomeAway
          </Link>

          <div className="flex items-center gap-5 text-sm text-gray-600">
            <Link to="/home" className="hover:text-indigo-600">🏠 Home</Link>
            <Link to="/inbox" className="hover:text-indigo-600">💬 Messages</Link>
            <Link to="/notifications" className="hover:text-indigo-600">🔔 Notifications</Link>
            <Link to="/create-post" className="hover:text-indigo-600">➕ New Post</Link>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="bg-white/70 px-5 py-2 rounded-full w-1/3 outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* PAGE CONTENT */}
      <div className="max-w-5xl mx-auto p-6">
        {children}
      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Dashboard() {

  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setPosts(list);
    };

    loadPosts();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      {/* NAVBAR */}
      <div className="glass-effect flex items-center justify-between px-8 py-4 shadow-sm">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          <Link to="/home" className="text-xl font-bold gradient-text">
            🏡 HomeAway
          </Link>

          <div className="flex items-center gap-5 text-sm text-gray-600">

            <Link to="/home" className="hover:text-indigo-600 transition">
              🏠 Home
            </Link>

            <Link to="/inbox" className="hover:text-indigo-600 transition">
              💬 Messages
            </Link>

            <Link to="/notifications" className="hover:text-indigo-600 transition">
              🔔 Notifications
            </Link>

            <Link to="/create-post" className="hover:text-indigo-600 transition">
              ➕ New Post
            </Link>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search posts..."
            className="bg-white/70 px-5 py-2 rounded-full w-64 outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>

      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">

        {/* HERO */}
        <div className="glass-effect p-8 rounded-2xl text-center mb-6 hover-lift">
          <h2 className="text-3xl font-bold gradient-text mb-2">
            📈 Community Feed
          </h2>
          <p className="text-gray-500">
            Connect, share, and discover with fellow students
          </p>
        </div>

        {/* POSTS */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="glass-effect p-6 rounded-2xl hover-lift cursor-pointer transition hover:scale-[1.01]"
            >

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-semibold">
                    {post.userName || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {post.createdAt?.toDate?.().toLocaleString()}
                  </p>
                </div>

                <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs">
                  {post.category}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {post.title}
              </h3>

              <p className="text-gray-600 mb-4">
                {post.message}
              </p>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
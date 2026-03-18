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

        <div className="flex items-center gap-4">
          <input
            placeholder="Search posts..."
            className="bg-purple-50 border-2 border-purple-300 px-5 py-2 rounded-full w-64"
          />

          <button
            onClick={handleLogout}
            className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>

      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">

        <div className="glass-effect p-8 rounded-2xl text-center mb-6">
          <h2 className="text-3xl font-bold gradient-text">📈 Community Feed</h2>
          <p className="text-gray-500">Connect, share, and discover</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="glass-effect p-6 rounded-2xl cursor-pointer hover:scale-[1.01]"
            >
              <p className="text-sm font-semibold">{post.userName}</p>

              <h3 className="font-semibold text-lg">{post.title}</h3>

              <p className="text-gray-600">{post.message}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
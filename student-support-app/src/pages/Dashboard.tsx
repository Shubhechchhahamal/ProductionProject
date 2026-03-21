import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  collectionGroup
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { setupPresence } from "../presence";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const navigate = useNavigate();

  // ✅ PRESENCE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setupPresence();
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ POSTS (REAL-TIME)
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPosts(list);
    });

    return () => unsubscribe();
  }, []);

  // ✅ 🔥 REAL-TIME MESSAGE COUNT (FIXED PROPERLY)
  useEffect(() => {
    let unsubscribeMessages: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collectionGroup(db, "messages"),
        where("receiverId", "==", user.uid),
        where("read", "==", false)
      );

      unsubscribeMessages = onSnapshot(q, (snapshot) => {
        console.log("LIVE MESSAGE COUNT:", snapshot.size);
        setUnreadMessages(snapshot.size);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, []);

  // ✅ 🔔 NOTIFICATIONS (ALREADY WORKING)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter(
          (post) => (post.category || "General") === selectedCategory
        );

  const categories = [
    "All",
    "Accommodation",
    "Part-time Job",
    "Academic Support",
    "Events & Gatherings",
    "Friends",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] pb-24 md:pb-0">

      {/* HERO */}
      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl p-6 shadow text-center mx-4 sm:mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-600">
          📈 Community Feed
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Connect, share, and discover with fellow international students
        </p>
      </div>

      {/* CATEGORY */}
      <div className="max-w-4xl mx-auto mt-4 flex gap-3 flex-wrap justify-center px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border text-sm transition ${
              selectedCategory === cat
                ? "bg-purple-500 text-white border-purple-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS */}
      <div className="max-w-4xl mx-auto mt-6 space-y-5 p-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <p className="font-semibold text-gray-800">{post.userName}</p>

              <p className="text-xs text-gray-400">
                {post.createdAt?.toDate?.().toLocaleString()}
              </p>

              <h3 className="text-lg sm:text-xl font-bold mt-3 text-gray-900">
                {post.title}
              </h3>

              <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                {post.message}
              </p>

              <div className="flex justify-end mt-4">
                <span className="text-purple-600 text-sm font-medium">
                  View Details →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            No posts found in this category.
          </div>
        )}
      </div>

    </div>
  );
}
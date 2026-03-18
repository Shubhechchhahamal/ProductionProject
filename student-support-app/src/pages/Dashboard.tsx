import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Dashboard() {

  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const navigate = useNavigate();

  // ✅ LOAD POSTS
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPosts(list);
    });

    return () => unsubscribe();
  }, []);

  // 💬 MESSAGES COUNT
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    let unsubscribes: any[] = [];
    let counts: Record<string, number> = {};

    const unsubscribeChats = onSnapshot(chatsQuery, (chatSnap) => {

      unsubscribes.forEach(unsub => unsub());
      unsubscribes = [];

      chatSnap.forEach((chatDoc) => {

        const messagesRef = collection(db, "chats", chatDoc.id, "messages");

        const unreadQuery = query(
          messagesRef,
          where("read", "==", false)
        );

        const unsub = onSnapshot(unreadQuery, (snap) => {

          let count = 0;

          snap.forEach((doc) => {
            const data = doc.data();
            if (data.senderId !== user.uid) count++;
          });

          counts[chatDoc.id] = count;

          const total = Object.values(counts).reduce((a, b) => a + b, 0);
          setUnreadMessages(total);
        });

        unsubscribes.push(unsub);
      });

    });

    return () => {
      unsubscribeChats();
      unsubscribes.forEach(unsub => unsub());
    };

  }, []);

  // 🔔 NOTIFICATIONS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribeNotif = onSnapshot(notifQuery, (snap) => {
      setUnreadNotifications(snap.size);
    });

    return () => unsubscribeNotif();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      {/* NAVBAR */}
      <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">

        <div className="flex items-center gap-6">
          <Link to="/home" className="text-xl font-bold text-purple-600">
            🏡 HomeAway
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-600">

            <Link to="/home">🏠 Home</Link>

            {/* 💬 MESSAGES */}
            <div className="relative">
              <Link to="/inbox">💬 Messages</Link>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-[2px] rounded-full">
                  {unreadMessages}
                </span>
              )}
            </div>

            {/* 🔔 NOTIFICATIONS */}
            <div className="relative">
              <Link to="/notifications">🔔 Notifications</Link>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-[2px] rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </div>

            <Link to="/create-post">➕ New Post</Link>

          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            placeholder="Search posts..."
            className="bg-purple-50 border border-purple-300 px-4 py-2 rounded-full w-64"
          />

          <button
            onClick={handleLogout}
            className="bg-purple-500 text-white px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-2xl p-6 shadow text-center">
        <h2 className="text-3xl font-bold text-purple-600">
          📈 Community Feed
        </h2>
        <p className="text-gray-500 mt-2">
          Connect, share, and discover with fellow international students
        </p>
      </div>

      {/* CATEGORY PILLS */}
      <div className="max-w-4xl mx-auto mt-4 flex gap-3 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border transition ${
              selectedCategory === cat
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS */}
      <div className="max-w-4xl mx-auto mt-6 space-y-5 p-4">

        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold text-gray-800">
                  {post.userName}
                </p>
                <p className="text-xs text-gray-400">
                  {post.createdAt?.toDate?.().toLocaleString()}
                </p>
              </div>

              <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                {post.category || "General"}
              </span>

            </div>

            <h3 className="text-lg font-bold mt-3">
              {post.title}
            </h3>

            <p className="text-gray-600 mt-1">
              {post.message}
            </p>

            <div className="flex justify-end mt-4">
              <span className="text-purple-600 text-sm font-medium">
                View Details →
              </span>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
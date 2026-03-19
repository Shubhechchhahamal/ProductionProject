import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  getDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [userName, setUserName] = useState("");

  const navigate = useNavigate();

  const isAdmin =
    auth.currentUser?.email === "s.hamal2465@student.leedsbeckett.ac.uk";

  // LOAD USER NAME
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();

      setUserName(data?.name || "User");
    };

    loadUser();
  }, []);

  // LOAD POSTS (REAL-TIME)
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

  // MESSAGES COUNT
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
      unsubscribes.forEach((unsub) => unsub());
      unsubscribes = [];
      counts = {};

      if (chatSnap.empty) {
        setUnreadMessages(0);
      }

      chatSnap.forEach((chatDoc) => {
        const messagesRef = collection(db, "chats", chatDoc.id, "messages");

        const unreadQuery = query(messagesRef, where("read", "==", false));

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
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // NOTIFICATIONS (REAL-TIME)
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
            className={`px-4 py-2 rounded-full border text-sm sm:text-base transition ${
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

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.06)] z-50">
        <div className={`grid ${isAdmin ? "grid-cols-6" : "grid-cols-5"} h-16`}>
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center justify-center text-[11px] text-gray-700"
          >
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate("/inbox")}
            className="relative flex flex-col items-center justify-center text-[11px] text-gray-700"
          >
            <span className="text-lg">💬</span>
            <span>Inbox</span>
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-4 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] px-1 rounded-full">
                {unreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="relative flex flex-col items-center justify-center text-[11px] text-gray-700"
          >
            <span className="text-lg">🔔</span>
            <span>Alerts</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-4 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] px-1 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/students")}
              className="flex flex-col items-center justify-center text-[11px] text-gray-700"
            >
              <span className="text-lg">👥</span>
              <span>Students</span>
            </button>
          )}

          <button
            onClick={() => navigate("/create-post")}
            className="flex flex-col items-center justify-center text-[11px] text-gray-700"
          >
            <span className="text-lg">➕</span>
            <span>Post</span>
          </button>

          <button
            onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}
            className="flex flex-col items-center justify-center text-[11px] text-gray-700"
          >
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </button>
        </div>
      </div>

    </div>
  );
}
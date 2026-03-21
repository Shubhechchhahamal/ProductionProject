import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db, rtdb } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

export default function Navbar({
  unreadMessages,
  unreadNotifications,
}: any) {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

  // ✅ LOAD USER NAME 
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

  // ✅ ONLINE USERS LISTENER
  useEffect(() => {
    const statusRef = ref(rtdb, "status");

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};
      const currentUserId = auth.currentUser?.uid;

      const uniqueUsers = new Set<string>();

      Object.entries(data).forEach(([uid, user]: any) => {
        if (uid !== currentUserId && user?.state === "online") {
          uniqueUsers.add(uid);
        }
      });

      setOnlineCount(uniqueUsers.size);
    });

    return () => unsubscribe();
  }, []);

  const firstName = userName ? userName.split(" ")[0] : "User";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      {/* 🔥 DESKTOP NAVBAR (ONE LINE) */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-6 text-sm text-gray-600">

            <Link to="/home" className="text-lg font-bold text-purple-600">
              HomeAway
            </Link>

            <Link to="/home">🏠 Home</Link>

            <div className="relative">
              <Link to="/inbox">💬 Messages</Link>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </div>

            <div className="relative">
              <Link to="/notifications">🔔 Notifications</Link>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </div>

            <button onClick={() => navigate("/students")}>
              👥 Students {onlineCount > 0 && `(${onlineCount})`}
            </button>

            <Link to="/create-post">➕ Post</Link>

            <button onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}>
              👤 Profile
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-semibold text-gray-800">
                {firstName}
              </span> 👋
            </div>

            <button
              onClick={handleLogout}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full"
            >
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* 🔥 MOBILE BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 md:hidden z-50">

        <button onClick={() => navigate("/home")}>🏠</button>

        <div className="relative">
          <button onClick={() => navigate("/inbox")}>💬</button>
          {unreadMessages > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {unreadMessages}
            </span>
          )}
        </div>

        <button onClick={() => navigate("/create-post")}>➕</button>

        <div className="relative">
          <button onClick={() => navigate("/notifications")}>🔔</button>
          {unreadNotifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {unreadNotifications}
            </span>
          )}
        </div>

        <button onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}>
          👤
        </button>
      </div>
    </>
  );
}
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

  // ✅ LISTEN TO ONLINE USERS (FIXED)
  useEffect(() => {
    const statusRef = ref(rtdb, "status");

    onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};

      const currentUserId = auth.currentUser?.uid;

      // ✅ prevent duplicates + exclude yourself
      const uniqueUsers = new Set<string>();

      Object.entries(data).forEach(([uid, user]: any) => {
        if (uid !== currentUserId && user?.state === "online") {
          uniqueUsers.add(uid);
        }
      });

      setOnlineCount(uniqueUsers.size);
    });
  }, []);

  const firstName = userName ? userName.split(" ")[0] : "User";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">

        {/* TOP ROW */}
        <div className="flex items-center justify-between gap-4">
          <Link to="/home" className="text-2xl font-bold text-purple-600">
            HomeAway
          </Link>

          <div className="hidden md:block text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-gray-800">
              {firstName}
            </span> 👋
          </div>

          <button
            onClick={handleLogout}
            className="hidden md:block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>

        {/* NAV */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 mt-4">
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

          {/* ✅ FIXED STUDENTS COUNT */}
          <button onClick={() => navigate("/students")}>
            👥 Students {onlineCount > 0 && `(${onlineCount} online)`}
          </button>

          <Link to="/create-post">➕ Post</Link>

          <button onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}>
            👤 Profile
          </button>
        </div>
      </div>
    </div>
  );
}
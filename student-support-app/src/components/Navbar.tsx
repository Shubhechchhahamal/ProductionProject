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
      {/* DESKTOP NAVBAR */}
      <div className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            <Link to="/home" className="text-lg font-bold text-purple-600 whitespace-nowrap">
              HomeAway
            </Link>

            <Link to="/home" className="hover:text-purple-600">
              🏠 Home
            </Link>

            <div className="relative">
              <Link to="/inbox" className="hover:text-purple-600">
                💬 Messages
              </Link>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </div>

            <div className="relative">
              <Link to="/notifications" className="hover:text-purple-600">
                🔔 Notifications
              </Link>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate("/students")}
              className="hover:text-purple-600"
            >
              👥 Students {onlineCount > 0 && `(${onlineCount})`}
            </button>

            <Link to="/create-post" className="hover:text-purple-600">
              ➕ Post
            </Link>

            <button
              onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}
              className="hover:text-purple-600"
            >
              👤 Profile
            </button>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Welcome,{" "}
              <span className="font-semibold text-gray-800">{firstName}</span> 👋
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

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm">
        <div className="grid grid-cols-5 items-center text-center py-3">
          <button onClick={() => navigate("/home")} className="text-2xl">
            🏠
          </button>

          <div className="relative flex justify-center">
            <button onClick={() => navigate("/inbox")} className="text-2xl">
              💬
            </button>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-6 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </div>

          <button onClick={() => navigate("/create-post")} className="text-3xl font-bold">
            +
          </button>

          <div className="relative flex justify-center">
            <button onClick={() => navigate("/notifications")} className="text-2xl">
              🔔
            </button>
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-6 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </div>

          <button
            onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}
            className="text-2xl"
          >
            👤
          </button>
        </div>
      </div>
    </>
  );
}
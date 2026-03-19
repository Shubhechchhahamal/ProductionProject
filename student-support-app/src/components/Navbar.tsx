import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({
  unreadMessages,
  unreadNotifications,
}: any) {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const isAdmin =
    auth.currentUser?.email === "s.hamal2465@student.leedsbeckett.ac.uk";

  // ✅ LOAD USER NAME HERE
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

          {isAdmin && (
            <button onClick={() => navigate("/students")}>
              👥 Students
            </button>
          )}

          <Link to="/create-post">➕ Post</Link>

          <button onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}>
            👤 Profile
          </button>
        </div>
      </div>
    </div>
  );
}
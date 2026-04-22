import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { setupPresence } from "./presence";
import {
  collection,
  query,
  where,
  onSnapshot,
  collectionGroup
} from "firebase/firestore";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import EditProfile from "./pages/EditProfile";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Students from "./pages/Students";

import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userName] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // ✅ Hold reference to presence cleanup function
  const presenceCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        console.log("USER DETECTED:", u.uid);
        // ✅ Store cleanup so we can call it on logout
        const cleanup = setupPresence();
        if (cleanup) presenceCleanupRef.current = cleanup;
      } else {
        // ✅ User logged out — clean up presence
        if (presenceCleanupRef.current) {
          presenceCleanupRef.current();
          presenceCleanupRef.current = null;
        }
      }
    });

    return () => {
      unsubscribe();
      // ✅ Clean up presence on unmount
      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    console.log("STARTING LISTENERS");

    const messagesQuery = query(
      collectionGroup(db, "messages"),
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      console.log("LIVE MESSAGE COUNT:", snapshot.size);
      setUnreadMessages(snapshot.size);
      localStorage.setItem("unreadMessages", snapshot.size.toString());
    });

    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribeNotif = onSnapshot(
      notifQuery,
      (snapshot) => {
        console.log("NOTIFICATIONS COUNT:", snapshot.size);
        setUnreadNotifications(snapshot.size);
        localStorage.setItem("unreadNotifications", snapshot.size.toString());
      },
      (error) => {
        console.error("Notifications listener error:", error);
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeNotif();
    };
  }, [user]);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.onLine) {
      const savedMessages = localStorage.getItem("unreadMessages");
      const savedNotifications = localStorage.getItem("unreadNotifications");
      if (savedMessages) setUnreadMessages(Number(savedMessages));
      if (savedNotifications) setUnreadNotifications(Number(savedNotifications));
    }
  }, []);

  const protectedLayout = (page: React.ReactNode) => (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">

        {isOffline && (
          <div className="bg-yellow-500 text-white text-center py-2 text-sm">
            You are offline. Some features may not work.
          </div>
        )}

        <Navbar
          userName={userName}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
        />

        {page}
      </div>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/home" element={protectedLayout(<Dashboard />)} />
      <Route path="/inbox" element={protectedLayout(<Inbox />)} />
      <Route path="/notifications" element={protectedLayout(<Notifications />)} />
      <Route path="/support" element={<Support />} />
      <Route path="/profile/:uid" element={protectedLayout(<Profile />)} />
      <Route path="/edit-profile" element={protectedLayout(<EditProfile />)} />
      <Route path="/create-post" element={protectedLayout(<CreatePost />)} />
      <Route path="/post/:id" element={protectedLayout(<PostPage />)} />
      <Route path="/students" element={protectedLayout(<Students />)} />
      <Route path="/chat/:chatId" element={protectedLayout(<Chat />)} />
    </Routes>
  );
}

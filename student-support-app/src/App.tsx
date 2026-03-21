import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";

import { useEffect, useState } from "react";
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

  // ✅ AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        console.log("USER DETECTED:", u.uid);
        setupPresence();
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ 🔥 FINAL REAL-TIME LISTENERS (FIXED PROPERLY)
  useEffect(() => {
    if (!user?.uid) return;

    console.log("STARTING LISTENERS");

    // ✅ 🔥 MESSAGES (FINAL CORRECT VERSION)
    const messagesQuery = query(
      collectionGroup(db, "messages"),
      where("receiverId", "==", user.uid),   // ✅ CRITICAL FIX
      where("read", "==", false)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      console.log("LIVE MESSAGE COUNT:", snapshot.size);
      setUnreadMessages(snapshot.size); // ✅ CLEAN + CORRECT
    });

    // ✅ 🔔 NOTIFICATIONS (UNCHANGED)
    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribeNotif = onSnapshot(
      notifQuery,
      (snapshot) => {
        console.log("🔔 NOTIFICATIONS COUNT:", snapshot.size);
        setUnreadNotifications(snapshot.size);
      },
      (error) => {
        console.error("❌ Notifications listener error:", error);
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeNotif();
    };

  }, [user]);

  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* PROTECTED */}

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Dashboard />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Inbox />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Notifications />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:uid"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Profile />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <EditProfile />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <CreatePost />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <PostPage />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Students />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <>
              <Navbar
                userName={userName}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
              />
              <Chat />
            </>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
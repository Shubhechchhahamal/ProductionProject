import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile"; // ✅ ADDED
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Students from "./pages/Students";

import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";
import { useState } from "react";

export default function App() {

  const [userName] = useState("");
  const [unreadMessages] = useState(0);
  const [unreadNotifications] = useState(0);

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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
              <Profile />
            </>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED EDIT PROFILE ROUTE */}
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <>
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
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
              <Navbar userName={userName} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
              <Chat />
            </>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
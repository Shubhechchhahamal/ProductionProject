import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

import CreateSupport from "./pages/CreateSupport";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import CheckEmail from "./pages/CheckEmail";

import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import Students from "./pages/Students";
import Notifications from "./pages/Notifications";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* ✅ PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/students" element={<Students />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/check-email" element={<CheckEmail />} />

      {/* 🔥 NEW: EMAIL VERIFICATION ROUTE */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ✅ PROTECTED ROUTES */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:uid"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateSupport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
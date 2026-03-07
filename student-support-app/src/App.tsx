import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreateSupport from "./pages/CreateSupport";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create" element={<CreateSupport />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user/:userId" element={<Profile />} />
      <Route path="/profile/:uid" element={<Profile />} />




      {/* Profile Page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Edit Profile Page */}
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* Dashboard Page */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

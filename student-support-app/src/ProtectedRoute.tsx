import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function ProtectedRoute({ children }: any) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading...
      </div>
    );
  }

  // If not logged in send to login
  if (!user) return <Navigate to="/login" replace />;

  // If logged in allow access
  return children;
}

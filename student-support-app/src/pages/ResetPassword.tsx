import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email.toLowerCase());
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Enter your university email"
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-500 text-sm mb-3 text-center">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition"
        >
          Send Reset Email
        </button>

        <p
          onClick={() => navigate("/login")}
          className="text-center text-sm text-gray-500 mt-4 cursor-pointer hover:underline"
        >
          Back to Login
        </p>

      </form>

    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useState } from "react";

export default function CheckEmail() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const checkVerification = async () => {
    setLoading(true);
    setMessage("");

    const user = auth.currentUser;

    try {
      await user?.reload();

      if (user?.emailVerified) {
        navigate("/login");
      } else {
        setMessage("Still not verified. Please check your email.");
      }
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">

        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          📩 Check your email
        </h2>

        <p className="text-gray-600 mb-6">
          Click the verification link in your email, then return here to continue.
        </p>

        {/* ✅ ONLY BUTTON */}
        <button
          onClick={checkVerification}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          {loading ? "Checking..." : "Continue"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="text-sm text-red-500 mt-3">{message}</p>
        )}

      </div>

    </div>
  );
}
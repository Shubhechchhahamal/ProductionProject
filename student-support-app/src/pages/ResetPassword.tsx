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

    try {
      await sendPasswordResetEmail(auth, email);
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
    <div className="w-full flex justify-center items-center p-6">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-center text-xl font-semibold text-[#7F5539]">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Enter your university email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}

        <button
          type="submit"
          className="bg-[#D6CCC2] w-full py-2 rounded text-[#7F5539] font-semibold hover:bg-[#B08968]"
        >
          Send Reset Email
        </button>

        <p
          onClick={() => navigate("/login")}
          className="text-center text-sm text-[#B08968] cursor-pointer"
        >
          Back to Login
        </p>
      </form>
    </div>
  );
}

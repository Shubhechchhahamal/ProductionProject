import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ Email validation
    if (
      !email.endsWith("@leedsbeckett.ac.uk") &&
      !email.endsWith("@student.leedsbeckett.ac.uk")
    ) {
      setError("Please use your Leeds Beckett University email.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found.");
      } else {
        setError("Login failed. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >

        <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
          Welcome Back 👋
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="University Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
        />

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition"
        >
          Login
        </button>

        {/* REGISTER LINK */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-purple-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

      </form>

    </div>
  );
}
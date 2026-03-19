import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !email.endsWith("@leedsbeckett.ac.uk") &&
      !email.endsWith("@student.leedsbeckett.ac.uk")
    ) {
      setError("Only Leeds Beckett University student emails are allowed.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await sendEmailVerification(user);

      const userRef = doc(db, "users", user.uid);
      const existingUser = await getDoc(userRef);

      if (!existingUser.exists()) {
        await setDoc(userRef, {
          name,
          email,
          createdAt: new Date().toISOString(),
        });
      }

      setSuccess("Verification email sent! Please check your inbox.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. Try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >

        <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
          ✨ Create Account
        </h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="University Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
          required
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* SUCCESS */}
        {success && (
          <p className="text-green-600 text-sm text-center mb-3">{success}</p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-purple-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </form>

    </div>
  );
}
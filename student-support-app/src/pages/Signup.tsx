import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    if (!fullName || !email || !password) {
      setMessage("Please fill all fields");
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

      // ✅ Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email,
        createdAt: serverTimestamp()
      });

      setMessage("Account created successfully!");

    } catch (error: any) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] px-4">

      <div className="glass-effect p-10 rounded-2xl shadow w-full max-w-md space-y-5">

        <h2 className="text-2xl font-bold text-center gradient-text">
          ✨ Create Account
        </h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="text-sm text-center text-gray-600">
            {message}
          </p>
        )}

        {/* LOGIN LINK */}
        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 hover:underline">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}
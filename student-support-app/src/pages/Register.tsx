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

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] px-4">

      <form
        onSubmit={handleRegister}
        className="glass-effect p-8 rounded-2xl shadow w-full max-w-md space-y-5"
      >

        <h2 className="text-center text-2xl font-bold gradient-text">
          ✨ Create Account
        </h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="University Email"
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* SUCCESS */}
        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
        >
          {loading ? "Creating..." : "Register"}
        </button>

      </form>

    </div>
  );
}
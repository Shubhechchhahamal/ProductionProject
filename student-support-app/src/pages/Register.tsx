import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  setDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
 serverTimestamp   
 } from "firebase/firestore";
 import { useNavigate } from "react-router-dom";

export default function Register() {
 
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  //  CHECK IF USER ALREADY EXISTS IN FIRESTORE
  const checkExistingUser = async (email: string) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.toLowerCase();

    // Email restriction
    if (
      !normalizedEmail.endsWith("@leedsbeckett.ac.uk") &&
      !normalizedEmail.endsWith("@student.leedsbeckett.ac.uk")
    ) {
      setError("Only Leeds Beckett University student emails are allowed.");
      return;
    }

    try {
      setLoading(true);

      //  CHECK FIRESTORE FIRST
      const exists = await checkExistingUser(normalizedEmail);

      if (exists) {
        setError("User already exists. Please login.");
        setLoading(false);
        return;
      }

      //  CREATE USER IN AUTH
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const user = userCredential.user;

      // SEND VERIFICATION EMAIL
      await sendEmailVerification(user, {
       url: "https://homeaway-ab63f.web.app/verify-success",
      });

     

      await setDoc(doc(db, "users", user.uid), {
      name,
      email: normalizedEmail,
      createdAt: serverTimestamp(),

  //  NEW FIELDS 
  isOnline: true,
  lastActive: serverTimestamp(),
});

      //  SIGN OUT UNTIL VERIFIED
      await signOut(auth);

      setSuccess("Verification email sent!");

      navigate("/check-email");

    } catch (err: any) {

      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message);
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
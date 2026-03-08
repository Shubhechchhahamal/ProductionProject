import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
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
  };

  return (
    <div className="w-full flex justify-center items-center p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >

        <h2 className="text-center text-xl font-semibold text-[#7F5539]">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="University Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        <button
          type="submit"
          className="bg-[#D6CCC2] w-full py-2 rounded text-[#7F5539] font-semibold hover:bg-[#B08968]"
        >
          Register
        </button>

      </form>
    </div>
  );
}
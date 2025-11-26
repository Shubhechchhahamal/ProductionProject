import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
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

    console.log("Register button clicked");

    // ONLY Leeds Beckett students allowed
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

      // 🔥 Send verification email
      await sendEmailVerification(userCredential.user);

      setSuccess("Verification email sent! Please check your inbox.");

      // Save basic profile (not verified yet)
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        verified: false,
        createdAt: new Date().toISOString(),
      });

      // Optionally redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.message);
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
        />

        <input
          type="email"
          placeholder="University Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 🔴 Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 🟢 Success Message */}
        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

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

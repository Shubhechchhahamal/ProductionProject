import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to generate 6-digit OTP
  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only Leeds Beckett emails allowed
    if (
      !email.endsWith("@leedsbeckett.ac.uk") &&
      !email.endsWith("@student.leedsbeckett.ac.uk")
    ) {
      setError("Only Leeds Beckett University student emails are allowed.");
      return;
    }

    try {
      // 1️⃣ Create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2️⃣ Generate OTP
      const code = generateCode();
      const expireTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString();

      // 3️⃣ Save OTP in Firestore
      await setDoc(doc(db, "otp", user.uid), {
        code,
        createdAt: Date.now(),
      });

      // 4️⃣ Save user profile with verified = false
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        verified: false,
        createdAt: new Date().toISOString(),
      });

     // 5️⃣ Send OTP email via EmailJS
await emailjs.send(
  "Homeaway_app",          // SERVICE ID
  "template_4z1h9lv",      // TEMPLATE ID
  {
    email: email,
    passcode: code,
    time: expireTime,
  },
  "sed1ZCO6P3qj2CcqK"      // PUBLIC KEY
);


      setSuccess("A verification code has been sent to your email.");
      setTimeout(() => navigate("/verify-code"), 2000);

    } catch (err: any) {
      console.error(err);
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

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Success Message */}
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

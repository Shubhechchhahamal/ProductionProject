import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase"; // make sure this path is correct

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      setMessage("Verification email sent! Please check your inbox.");

    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8F3EF] to-[#F1E8E0] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center mb-6 text-[#B08968]">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 border border-[#E6DCD3] rounded-lg bg-[#F8F5F2]"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-[#E6DCD3] rounded-lg bg-[#F8F5F2]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-[#E6DCD3] rounded-lg bg-[#F8F5F2]"
        />

        <button
          onClick={handleRegister}
          className="w-full py-3 rounded-lg bg-[#EDE0D4] text-[#7F5539] font-medium hover:bg-[#D6CCC2] transition"
        >
          Register
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-[#7F5539]">
            {message}
          </p>
        )}

        <p className="text-sm text-center mt-4 text-[#7F5539]">
          Already have an account?{" "}
          <Link to="/login" className="underline text-[#B08968]">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
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

    if (
      !email.endsWith("@leedsbeckett.ac.uk") &&
      !email.endsWith("@student.leedsbeckett.ac.uk")
    ) {
      setError("Please use your Leeds Beckett University student email.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      navigate("/home");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found.");
      } else {
        setError("Something went wrong.");
      }
    }
  };

  return (
    <div className="w-full flex justify-center items-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-center text-xl font-semibold text-[#7F5539]">
          Login
        </h2>

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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="bg-[#D6CCC2] w-full py-2 rounded text-[#7F5539] font-semibold hover:bg-[#B08968]"
        >
          Login
        </button>

        <p className="text-center text-sm text-[#7F5539]">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#B08968] cursor-pointer"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

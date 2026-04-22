import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function VerifyEmail() {

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const user = auth.currentUser;

        // If no user session (common after email click)
        if (!user) {
          setMessage("Email verified! Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }

        await user.reload(); // 🔥 important

        if (user.emailVerified) {
          setMessage("Email verified! Redirecting to login...");

          await auth.signOut();

          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);

        } else {
          setMessage("Verification failed. Please try again.");
        }

      } catch (err) {
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-semibold text-purple-600">
          {message}
        </h2>
      </div>
    </div>
  );
}
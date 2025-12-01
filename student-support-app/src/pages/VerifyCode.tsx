import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export default function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ⭐ Ensure Firebase loads user properly
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleVerify = async () => {
    setError("");

    if (!currentUser) {
      setError("Loading user… please wait 1 second.");
      return;
    }

    setLoading(true);

    const ref = doc(db, "otp", currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setError("No verification code found.");
      setLoading(false);
      return;
    }

    const data = snap.data();

    // Check code
    if (data.code !== code) {
      setError("Incorrect verification code.");
      setLoading(false);
      return;
    }

    // Check expiry
    const now = Date.now();
    if (now - data.createdAt > 15 * 60 * 1000) {
      setError("Verification code expired.");
      setLoading(false);
      return;
    }

    // Mark user verified
    await updateDoc(doc(db, "users", currentUser.uid), {
      verified: true,
    });

    // Delete OTP
    await deleteDoc(ref);

    alert("Email verified successfully!");

    // ⭐ SIGN OUT user before redirecting to login
    await auth.signOut();

    // ⭐ Redirect to login page instead of /home
    setTimeout(() => {
      navigate("/login");
    }, 300);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-4">

        <h2 className="text-center text-2xl font-semibold text-[#7F5539]">
          Verify Your Email
        </h2>

        {!currentUser && (
          <p className="text-center text-gray-500 mb-2">Loading user...</p>
        )}

        <input
          type="text"
          maxLength={6}
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 border rounded text-center tracking-widest text-lg"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-[#D6CCC2] w-full py-3 rounded text-[#7F5539] font-semibold hover:bg-[#B08968] disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </div>
    </div>
  );
}

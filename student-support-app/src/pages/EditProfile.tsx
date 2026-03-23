import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState("");
  const [yearsInUK, setYearsInUK] = useState("");
  const [helpOffer, setHelpOffer] = useState("");

  //  LOAD USER DATA
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login"); // safety
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setCountry(data.country || "");
        setLanguages(data.languages || "");
        setYearsInUK(data.yearsInUK || "");
        setHelpOffer(data.helpOffer || "");
      }

      setLoading(false);
    };

    load();
  }, []);

  //  SAVE PROFILE
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        country,
        languages,
        yearsInUK,
        helpOffer,
      });

      //  GO BACK TO PROFILE WITH UID
      navigate(`/profile/${user.uid}`);

    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
    }
  };

  //  LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] flex justify-center items-center">
        <div className="glass-effect w-64 h-32 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const currentUser = auth.currentUser;

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <div className="max-w-xl mx-auto">

        {/* BACK */}
        <button
          className="mb-6 text-indigo-500 hover:underline"
          onClick={() => {
            if (currentUser) {
              navigate(`/profile/${currentUser.uid}`);
            } else {
              navigate("/home"); // fallback
            }
          }}
        >
          ← Back to Profile
        </button>

        {/* FORM CARD */}
        <div className="glass-effect p-8 rounded-2xl shadow space-y-5">

          <h1 className="text-2xl font-bold gradient-text text-center">
            ✏️ Edit Profile
          </h1>

          {/* NAME */}
          <input
            className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />

          {/* COUNTRY */}
          <input
            className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
          />

          {/* LANGUAGES */}
          <input
            className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Languages (comma-separated)"
          />

          {/* YEARS */}
          <input
            className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            value={yearsInUK}
            onChange={(e) => setYearsInUK(e.target.value)}
            placeholder="How long have you been in the UK?"
          />

          {/* HELP OFFER */}
          <textarea
            className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300 h-28"
            value={helpOffer}
            onChange={(e) => setHelpOffer(e.target.value)}
            placeholder="How can you help other international students?"
          />

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}
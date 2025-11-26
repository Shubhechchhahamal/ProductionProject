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

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

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

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      name,
      country,
      languages,
      yearsInUK,
      helpOffer,
    });

    navigate("/profile");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F3EF] p-6 text-[#7F5539]">

      <button
        className="mb-6 text-sm underline"
        onClick={() => navigate("/profile")}
      >
        ← Back to Profile
      </button>

      <div className="bg-white max-w-xl mx-auto p-8 rounded-3xl shadow space-y-4">

        <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

        <input
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />

        <input
          className="w-full p-2 border rounded"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
        />

        <input
          className="w-full p-2 border rounded"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="Languages (comma-separated)"
        />

        <input
          className="w-full p-2 border rounded"
          value={yearsInUK}
          onChange={(e) => setYearsInUK(e.target.value)}
          placeholder="How long have you been in the UK?"
        />

        <textarea
          className="w-full p-2 border rounded"
          value={helpOffer}
          onChange={(e) => setHelpOffer(e.target.value)}
          placeholder="How can you help other international students?"
        />

        <button
          onClick={handleSave}
          className="bg-[#D6CCC2] w-full py-2 rounded text-[#7F5539] font-semibold hover:bg-[#B08968]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

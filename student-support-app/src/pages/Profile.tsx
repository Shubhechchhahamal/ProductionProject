import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Convert country → flag emoji
const getFlag = (country: string) => {
  if (!country) return "";

  const c = country.toLowerCase();

  if (c.startsWith("nep") || c === "np") return "🇳🇵";

  const code = country.slice(0, 2).toUpperCase();
  return code.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setUserData(snap.data());

      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!userData) return <div className="p-10 text-center">No user info found</div>;

  return (
    <div className="min-h-screen bg-[#F8F3EF] p-6 text-[#7F5539]">
      <button
        className="mb-6 text-sm underline"
        onClick={() => navigate("/home")}
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white max-w-xl mx-auto p-8 rounded-3xl shadow">

        {/* Profile Circle */}
        <div className="w-24 h-24 bg-[#EDE0D4] rounded-full mx-auto mb-4"></div>

        <h1 className="text-2xl font-bold text-center">
          {userData.name || "Unknown User"}
        </h1>

        {/* Country */}
        <p className="text-center text-sm opacity-80 flex justify-center items-center gap-2 mt-1">
          <span>{getFlag(userData.country)}</span>
          <span className="capitalize">{userData.country || "Not added"}</span>
        </p>

        {/* Languages */}
        <p className="text-center text-sm mt-1 opacity-70 flex justify-center items-center gap-1">
          <span>🗣️</span>
          <span>
            {Array.isArray(userData.languages)
              ? userData.languages.join(", ")
              : userData.languages}
          </span>
        </p>

        {/* Years in UK */}
        {userData.yearsInUK ? (
          <p className="text-center text-sm mt-2 font-medium">
            🎓 In the UK for {userData.yearsInUK}
          </p>
        ) : (
          <p className="text-center text-sm mt-2 opacity-50">
            Time in UK not added
          </p>
        )}

        {/* Help Offer */}
        {userData.helpOffer ? (
          <div className="mt-4 text-center bg-[#EDE0D4] p-3 rounded-xl">
            <p className="text-sm font-semibold">💡 I can help with:</p>
            <p className="text-sm opacity-80 mt-1">{userData.helpOffer}</p>
          </div>
        ) : (
          <p className="text-center text-sm mt-4 opacity-50">
            Help offer not added
          </p>
        )}

        {/* Edit Button */}
        <button
          onClick={() => navigate("/edit-profile")}
          className="mt-5 px-4 py-2 bg-[#D6CCC2] text-[#7F5539] rounded-xl hover:bg-[#B08968] font-semibold mx-auto block"
        >
          Edit Profile
        </button>
      </div>

      {/* Posts */}
      <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded-3xl shadow">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>

        <div className="text-sm opacity-60 flex items-center gap-2">
          <span>📭</span> You have no posts yet.
        </div>
      </div>
    </div>
  );
}

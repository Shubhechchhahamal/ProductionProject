import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

// Convert country → 2-letter ISO country code for SVG flags
function getCountryCode(country: string) {
  if (!country) return null;

  const c = country.toLowerCase();

  if (c.startsWith("nep")) return "np";
  if (c.startsWith("uni") || c.includes("kingdom")) return "gb";
  if (c.startsWith("ind")) return "in";
  if (c.startsWith("chi")) return "cn";
  if (c.startsWith("pak")) return "pk";
  if (c.startsWith("ban")) return "bd";
  if (c.startsWith("sri")) return "lk";

  return country.slice(0, 2).toLowerCase();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setName(data.name || "");
        setCountry(data.country || "");
        setLanguages(
          Array.isArray(data.languages)
            ? data.languages
            : data.languages?.split(",") || []
        );
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">
      <h1 className="text-3xl font-bold mb-1">Welcome, {name} 👋</h1>

    {/* Country Flag + Language */}
<div className="flex items-center gap-3 mb-6">

  {/* FLAG ONLY */}
  {country && (
    <img
      src={`https://flagcdn.com/${getCountryCode(country)}.svg`}
      alt="flag"
      className="w-6 h-4 rounded-sm shadow"
    />
  )}

  {/* Languages */}
  {languages.length > 0 && (
    <span className="opacity-70 text-sm">• {languages.join(", ")}</span>
  )}
</div>


      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => navigate("/profile")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] transition text-left"
        >
          <h2 className="text-xl font-semibold">My Profile</h2>
          <p className="text-sm mt-2">View & edit your student info</p>
        </button>

        <button
          onClick={() => navigate("/search")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] transition text-left"
        >
          <h2 className="text-xl font-semibold">Find Help</h2>
          <p className="text-sm mt-2">
            Search topics like housing, jobs, culture shock
          </p>
        </button>

        <button
          onClick={() => navigate("/messages")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] transition text-left"
        >
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm mt-2">Talk privately with other students</p>
        </button>

        <button
          onClick={() => navigate("/posts")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] transition text-left"
        >
          <h2 className="text-xl font-semibold">Community</h2>
          <p className="text-sm mt-2">See helpful posts & events</p>
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 bg-[#B08968] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#7F5539]"
      >
        Logout
      </button>
    </div>
  );
}


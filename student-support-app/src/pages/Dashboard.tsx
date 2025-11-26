import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

// Convert country to a flag emoji
function getFlagEmoji(country: string) {
  if (!country) return "";

  // Special case: Nepal has a unique flag emoji
  if (country.toLowerCase().startsWith("nep")) {
    return "🇳🇵";
  }

  const code = country.slice(0, 2).toUpperCase();
  return code.replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );
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
        setLanguages(data.languages || []);
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
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {name} 👋
      </h1>

      {/* Minimal flag + languages */}
      <p className="text-md text-[#7F5539] opacity-75 mb-6 flex items-center gap-2">
        {country && <span>{getFlagEmoji(country)}</span>}
        {languages.length > 0 && (
          <span>{languages.join(", ")}</span>
        )}
      </p>

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



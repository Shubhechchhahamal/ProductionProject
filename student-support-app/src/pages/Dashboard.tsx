import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

// Convert country → ISO flag code
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
  const [posts, setPosts] = useState<any[]>([]);

  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadData = async () => {

      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        // Load latest posts
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const postSnapshot = await getDocs(q);

const postList = await Promise.all(
  postSnapshot.docs.map(async (docSnap) => {

    const data = docSnap.data() as any;

    const repliesRef = collection(db, "posts", docSnap.id, "replies");
    const repliesSnapshot = await getDocs(repliesRef);

    return {
  id: docSnap.id,
  ...data,
  commentCount: repliesSnapshot.size
};
  })
);

        setPosts(postList);

        // Load user profile
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {

          const data: any = userSnapshot.data();

          setName(data.name || "");
          setCountry(data.country || "");

          setLanguages(
            Array.isArray(data.languages)
              ? data.languages
              : data.languages?.split(",") || []
          );
        }

        // Load statistics
        const usersSnapshot = await getDocs(collection(db, "users"));
        const postsSnapshot = await getDocs(collection(db, "posts"));

        setUserCount(usersSnapshot.size);
        setPostCount(postsSnapshot.size);

        const countries = new Set();

        usersSnapshot.forEach((doc) => {
          const data: any = doc.data();
          if (data.country) {
            countries.add(data.country);
          }
        });

        setCountryCount(countries.size);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      }

      setLoading(false);
    };

    loadData();

  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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
        Welcome back, {name} 👋
      </h1>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-4 mb-8 mt-4">

        <div className="bg-[#EDE0D4] px-4 py-2 rounded-lg shadow text-sm">
          👥 {userCount} students joined
        </div>

        <div className="bg-[#EDE0D4] px-4 py-2 rounded-lg shadow text-sm">
          💬 {postCount} support posts
        </div>

        <div className="bg-[#EDE0D4] px-4 py-2 rounded-lg shadow text-sm">
          🌍 {countryCount} countries represented
        </div>

      </div>

      {/* Country + Languages */}
      <div className="flex items-center gap-3 mb-6">

        {country && (
          <img
            src={`https://flagcdn.com/${getCountryCode(country)}.svg`}
            alt="flag"
            className="w-6 h-4 rounded-sm shadow"
          />
        )}

        {languages.length > 0 && (
          <span className="opacity-70 text-sm">
            • {languages.join(", ")}
          </span>
        )}

      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        <button
          onClick={() => navigate("/profile")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] transition text-left"
        >
          <h2 className="text-xl font-semibold">My Profile</h2>
          <p className="text-sm mt-2">View & edit your student info</p>
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
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] hover:scale-[1.02] transition duration-200"
        >
          <h2 className="text-xl font-semibold">Community</h2>
          <p className="text-sm mt-2">See helpful posts & events</p>
        </button>

      </div>

      {/* Recent Posts */}
      <div className="space-y-4 mt-10">

        <h2 className="text-xl font-semibold">Recent Support Posts</h2>

        {posts.length === 0 ? (
          <p className="opacity-70">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="bg-[#EDE0D4] p-4 rounded-xl shadow hover:bg-[#D6CCC2] cursor-pointer transition"
            >
              <p
              onClick={(e) => {
               e.stopPropagation();
               navigate(`/profile/${post.userId}`);
             }}
              className="text-sm font-semibold hover:underline cursor-pointer"
              >
              {post.userName}
              </p>

              <p className="text-xs opacity-60">
                {post.category}
              </p>

              <p className="font-medium">{post.title}</p>

              <p className="text-sm opacity-80">
                {post.message}
              </p>
               
               <p className="text-xs opacity-70 mt-2">
                💬 {post.commentCount || 0} comments
               </p>

              {post.createdAt && (
                <p className="text-xs opacity-50 mt-1">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              )}

            </div>
          ))
        )}

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-10 bg-[#B08968] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#7F5539]"
      >
        Logout
      </button>

    </div>

  );
}
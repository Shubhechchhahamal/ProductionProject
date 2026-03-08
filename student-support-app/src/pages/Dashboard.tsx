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

export default function Dashboard() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const currentUser = auth.currentUser;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        /* ADMIN CHECK */

        if (
          currentUser.email?.toLowerCase() ===
          "s.hamal2465@student.leedsbeckett.ac.uk"
        ) {
          setIsAdmin(true);
        }

        /* LOAD USER PROFILE */

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data: any = userSnap.data();
          setName(data.name || "");
        }

        /* LOAD RECENT POSTS */

        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const postsSnap = await getDocs(postsQuery);

        const postsData = await Promise.all(
          postsSnap.docs.map(async (docSnap) => {

            const data: any = docSnap.data();

            const repliesRef = collection(db, "posts", docSnap.id, "replies");
            const repliesSnap = await getDocs(repliesRef);

            return {
              id: docSnap.id,
              userId: data.userId || null,
              userName: data.userName || "Unknown user",
              category: data.category || "",
              title: data.title || "",
              message: data.message || "",
              commentCount: repliesSnap.size
            };

          })
        );

        setPosts(postsData);

        /* LOAD USER COUNT */

        const usersSnap = await getDocs(collection(db, "users"));
        setUserCount(usersSnap.size);

      } catch (error) {

        console.error("Dashboard load error:", error);

      }

      setLoading(false);

    };

    loadDashboard();

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

  const firstName = name ? name.split(" ")[0] : "";

  return (

    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">

      {/* HEADER */}

      <div className="flex justify-between items-start mb-10">

        <div>

          <h1 className="text-3xl font-bold">
            Welcome, {firstName} 👋
          </h1>

          <p className="text-sm opacity-70 mt-1">
            Connect with other international students and find support.
          </p>

        </div>

        <img
          src="/homeaway-logo.png"
          alt="HomeAway"
          className="h-28 object-contain opacity-90"
        />

      </div>

      {/* ADMIN STATS */}

      {isAdmin && (

        <div className="grid grid-cols-1 gap-6 mb-10">

          <div
            onClick={() => navigate("/students")}
            className="bg-[#EDE0D4] p-8 rounded-2xl shadow text-center cursor-pointer hover:bg-[#D6CCC2] hover:-translate-y-1 hover:shadow-lg transition"
          >

            <p className="text-3xl font-bold">{userCount}</p>
            <p className="text-sm opacity-70">Students Joined</p>

          </div>

        </div>

      )}

      {/* DASHBOARD BUTTONS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        <button
          onClick={() => navigate("/profile")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] hover:shadow-lg hover:-translate-y-1 text-left transition"
        >

          <h2 className="text-xl font-semibold">👤 My Profile</h2>
          <p className="text-sm mt-2">View & edit your student info</p>

        </button>

        <button
          onClick={() => navigate("/inbox")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] hover:shadow-lg hover:-translate-y-1 text-left transition"
        >

          <h2 className="text-xl font-semibold">💬 Messages</h2>
          <p className="text-sm mt-2">Talk privately with other students</p>

        </button>

        <button
          onClick={() => navigate("/posts")}
          className="p-6 rounded-2xl shadow bg-[#EDE0D4] hover:bg-[#D6CCC2] hover:shadow-lg hover:-translate-y-1 text-left transition"
        >

          <h2 className="text-xl font-semibold">🌍 Community</h2>
          <p className="text-sm mt-2">See helpful posts</p>

        </button>

      </div>

      {/* RECENT POSTS */}

      <div className="space-y-4 mt-12">

        <h2 className="text-xl font-semibold">Recent Support Posts</h2>

        {posts.length === 0 ? (

          <p>No posts yet.</p>

        ) : (

          posts.map((post) => (

            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="bg-[#EDE0D4] p-5 rounded-2xl shadow hover:bg-[#D6CCC2] hover:shadow-lg cursor-pointer transition"
            >

              <p
                onClick={(e) => {

                  e.stopPropagation();

                  if (!post.userId) return;

                  navigate(`/profile/${post.userId}`);

                }}
                className="text-sm font-semibold hover:underline cursor-pointer"
              >

                {post.userName}

              </p>

              <p className="text-xs opacity-60">
                {post.category}
              </p>

              <p className="font-medium">
                {post.title}
              </p>

              <p className="text-sm opacity-80">
                {post.message}
              </p>

              <p className="text-xs opacity-70 mt-2">
                💬 {post.commentCount} comments
              </p>

            </div>

          ))

        )}

      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="mt-10 bg-[#B08968] hover:bg-[#9C6644] text-white px-6 py-3 rounded-xl transition"
      >

        Logout

      </button>

    </div>

  );

}
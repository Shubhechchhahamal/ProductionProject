
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Posts() {

  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadPosts = async () => {

      try {

        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const postList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(postList);
        setFilteredPosts(postList);

      } catch (error) {
        console.error("Error loading posts:", error);
      }

      setLoading(false);
    };

    loadPosts();

  }, []);

  const filterPosts = (category: string) => {

    setSelectedCategory(category);

    let filtered = posts;

    if (category !== "All") {
      filtered = filtered.filter((post) => post.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter((post) =>
        (post.title + post.message + post.category)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const handleSearch = (value: string) => {

    setSearchTerm(value);

    let filtered = posts;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (post) => post.category === selectedCategory
      );
    }

    if (value) {
      filtered = filtered.filter((post) =>
        (post.title + post.message + post.category)
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">

      <h1 className="text-3xl font-bold mb-4">
        Community Posts
      </h1>

      <button
        onClick={() => navigate("/create-post")}
        className="mb-6 bg-[#B08968] text-white px-5 py-2 rounded-lg hover:bg-[#7F5539]"
      >
        + Create Post
      </button>

      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full max-w-md p-3 mb-6 border rounded-lg"
      />

      {/* Category filters */}
      <div className="flex gap-3 mb-6 flex-wrap">

        {[
          "All",
          "Accommodation",
          "Part-time Job",
          "Academic Support",
          "Events & Gatherings",
          "Friends"
        ].map((cat) => (

          <button
            key={cat}
            onClick={() => filterPosts(cat)}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedCategory === cat
                ? "bg-[#7F5539] text-white"
                : "bg-[#EDE0D4]"
            }`}
          >
            {cat}
          </button>

        ))}

      </div>

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (

        <div className="space-y-4">

          {filteredPosts.map((post) => (

            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="bg-[#EDE0D4] p-4 rounded-xl shadow hover:bg-[#D6CCC2] cursor-pointer transition"
            >

              <p className="text-xs opacity-60">
                {post.category}
              </p>

              <h2 className="font-semibold text-lg">
                {post.title}
              </h2>

              <p className="text-sm opacity-80 mt-1">
                {post.message}
              </p>

              {post.createdAt && (
                <p className="text-xs opacity-50 mt-2">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}


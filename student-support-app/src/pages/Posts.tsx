import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

interface SupportPost {
  id: string;
  title: string;
  description: string;
  category: string;
  userEmail: string;
  createdAt: any;
}

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<SupportPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

useEffect(() => {
  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, "supports"));

    const fetchedPosts: SupportPost[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        userEmail: data.userEmail || "",
        createdAt: data.createdAt || null,
      };
    });

    setPosts(fetchedPosts);

    console.log("Fetched posts:", fetchedPosts);
  };

  fetchPosts();
}, []);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">
      <h1 className="text-3xl font-bold mb-6">Community Support</h1>

      {/* Create Button */}
      <button
        onClick={() => navigate("/create")}
        className="mb-6 bg-[#B08968] text-white px-6 py-2 rounded-lg"
      >
        + Create Support
      </button>

      {/* Category Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          "All",
          "Accommodation",
          "Part-time Jobs",
          "Academic Support",
          "Mental Health",
          "Visa & Immigration",
          "Social & Community",
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === cat
                ? "bg-[#7F5539] text-white"
                : "bg-[#EDE0D4]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-xl shadow bg-white"
          >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-sm opacity-70 mb-2">
              {post.category} • {post.userEmail}
            </p>
            <p>{post.description}</p>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <p className="opacity-60">No posts in this category yet.</p>
        )}
      </div>
    </div>
  );
}
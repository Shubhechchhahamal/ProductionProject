import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { setupPresence } from "../presence";
import { onAuthStateChanged } from "firebase/auth";

import Flag from "../components/Flags"; 

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setupPresence();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPosts(list);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter(
          (post) => (post.category || "General") === selectedCategory
        );

  const categories = [
    "All",
    "Accommodation",
    "Part-time Job",
    "Academic Support",
    "Events & Gatherings",
    "Friends",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-24 md:pb-0">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mt-0 bg-white rounded-2xl p-6 shadow-md border border-purple-100 text-center px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-600">
          📈 Community Feed
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Connect, share, and discover with fellow international students
        </p>
      </div>

      {/* CATEGORY FILTER */}
      <div className="max-w-4xl mx-auto mt-4 flex gap-3 flex-wrap justify-center px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border text-sm transition ${
              selectedCategory === cat
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-600 border-purple-100 hover:border-purple-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS */}
      <div className="max-w-4xl mx-auto mt-6 space-y-5 p-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-purple-100 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              {/* USER */}
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                {post.userName}
                {post.country && <Flag country={post.country} />}
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-400">
                {post.createdAt?.toDate?.().toLocaleString()}
              </p>

              {/* TITLE */}
              <h3 className="text-lg sm:text-xl font-bold mt-3 text-gray-900">
                {post.title}
              </h3>

              {/* MESSAGE */}
              <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                {post.message}
              </p>

              {/* IMAGES */}
              {(post.images?.length > 0 || post.imageUrl) && (
                post.images?.length === 1 ? (
                  <img
                    src={post.images[0]}
                    alt="post"
                    className="w-full max-h-[400px] object-contain rounded-lg mt-4"
                  />
                ) : (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {post.images?.slice(0, 4).map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt="post"
                        className="w-44 h-44 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )
              )}

              {!post.images && post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full max-h-[400px] object-contain rounded-lg mt-4"
                />
              )}

              {/* CTA */}
              <div className="flex justify-end mt-4">
                <span className="text-purple-600 text-sm font-medium">
                  View Details →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-8 text-center text-gray-500">
            No posts found in this category.
          </div>
        )}
      </div>

    </div>
  );
}
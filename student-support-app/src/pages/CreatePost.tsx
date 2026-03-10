import { useState } from "react";
import { db, auth } from "../firebase";
import { checkAIModeration } from "../utils/aiModeration";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Accommodation");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to post");
        setLoading(false);
        return;
      }

      // 🔹 AI MODERATION CHECK
      const safe = await checkAIModeration(title + " " + message);

      if (!safe) {
        alert("Your post contains harmful or abusive language.");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        message: message.trim(),
        category,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: userData?.name || "User"
      });

      navigate("/posts");

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while creating the post.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F3EF] p-6 text-[#7F5539]">

      <h1 className="text-3xl font-bold mb-6">
        Create a Post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4"
      >

        {/* Category */}
        <div>
          <label className="block text-sm mb-1">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-lg border"
          >
            <option>Accommodation</option>
            <option>Part-time Job</option>
            <option>Academic Support</option>
            <option>Events & Gatherings</option>
            <option>Friends</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm mb-1">
            Title
          </label>

          <input
            type="text"
            placeholder="Example: Room available near Leeds Beckett"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg border"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm mb-1">
            Message
          </label>

          <textarea
            placeholder="Write your post here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-lg border h-32"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#B08968] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#7F5539]"
        >
          {loading ? "Posting..." : "Create Post"}
        </button>

      </form>

    </div>
  );
}
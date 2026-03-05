import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateSupport() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description) {
      setError("Please fill all fields.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title: title,
        message: description,
        category: category,
        type: "request",
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || null,
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Failed to create post.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-center text-xl font-semibold text-[#7F5539]">
          Create Support Request
        </h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Describe your situation..."
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          <option value="Accommodation">Accommodation</option>
          <option value="Part-time Jobs">Part-time Jobs</option>
          <option value="Academic Support">Academic Support</option>
          <option value="Mental Health">Mental Health</option>
          <option value="Visa & Immigration">Visa & Immigration</option>
          <option value="Social & Community">Social & Community</option>
        </select>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-[#D6CCC2] w-full py-2 rounded text-[#7F5539] font-semibold hover:bg-[#B08968]"
        >
          Post
        </button>
      </form>
    </div>
  );
}
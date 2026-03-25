import { useState } from "react";
import { db, auth, storage } from "../firebase";
import { checkAIModeration } from "../utils/aiModeration";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Accommodation"); 
  const [loading, setLoading] = useState(false);

  // changed from single image to multiple
  const [images, setImages] = useState<File[]>([]);

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

      const safe = await checkAIModeration(title + " " + message);

      if (!safe) {
        alert("Your post contains harmful or abusive language.");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // upload multiple images
      let imageUrls: string[] = [];

      if (images.length > 0) {
        for (const img of images) {
          const imageRef = ref(storage, `posts/${Date.now()}_${img.name}`);
          await uploadBytes(imageRef, img);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }
      }

      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        message: message.trim(),
        category,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: userData?.name || "User",
        country: userData?.country || "",
        images: imageUrls // changed from imageUrl to images array
      });

      navigate("/home");

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while creating the post.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
          ✍️ Create a Post
        </h1>

        <form
          onSubmit={handleSubmit}
          className="glass-effect p-6 rounded-2xl shadow space-y-5"
        >

          <div>
            <label className="block text-sm mb-1 text-gray-600">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option>Accommodation</option>
              <option>Part-time Job</option>
              <option>Academic Support</option>
              <option>Events & Gatherings</option>
              <option>Friends</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">
              Title
            </label>

            <input
              type="text"
              placeholder="Example: Room available near Leeds Beckett"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">
              Message
            </label>

            <textarea
              placeholder="Write your post here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg border h-32 outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">
              Images (max 5)
            </label>

           <input
         type="file"
         multiple
         accept="image/*"
          onClick={(e) => {
         (e.target as HTMLInputElement).value = "";
       }}
         onChange={(e) => {
         const files = Array.from(e.target.files || []);

         const updated = [...images, ...files];

          if (updated.length > 5) {
          alert("You can upload up to 5 images only");
         return;
        }

    setImages(updated);
  }}
/>
             
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
          >
            {loading ? "Posting..." : "Create Post"}
          </button>

        </form>

      </div>

    </div>
  );
}
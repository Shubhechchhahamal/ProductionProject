import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { checkAIModeration } from "../utils/aiModeration";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PostPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);

  const adminEmail = "s.hamal2465@student.leedsbeckett.ac.uk";

  useEffect(() => {
    const loadPost = async () => {

      if (!id) return;

      try {

        const postSnap = await getDoc(doc(db, "posts", id));

        if (postSnap.exists()) {
          setPost(postSnap.data());
        }

        const repliesSnap = await getDocs(
          query(
            collection(db, "posts", id, "replies"),
            orderBy("createdAt", "asc")
          )
        );

        setReplies(
          repliesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      } catch (error) {
        console.error("Error loading post:", error);
      }

      setLoading(false);
    };

    loadPost();
  }, [id]);

  const handleReply = async () => {

    if (!newReply.trim() || !id) return;

    const user = auth.currentUser;
    if (!user) return alert("Login first");

    const safe = await checkAIModeration(newReply);
    if (!safe) return alert("Inappropriate content");

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.data();

    await addDoc(collection(db, "posts", id, "replies"), {
      message: newReply,
      createdAt: serverTimestamp(),
      userId: user.uid,
      userName: userData?.name || "User",
    });

    setNewReply("");

    const snap = await getDocs(
      query(collection(db, "posts", id, "replies"), orderBy("createdAt"))
    );

    setReplies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const currentUser = auth.currentUser;

  // 🔥 LOADING SKELETON
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="glass-effect p-6 rounded-2xl space-y-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
            <div className="h-6 w-1/2 bg-gray-300 rounded"></div>
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
          </div>

          <div className="glass-effect p-6 rounded-2xl space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
          </div>

        </div>
      </div>
    );
  }

  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] py-10 px-6"
    >

      <div className="max-w-3xl mx-auto">

        {/* POST */}
        <div className="glass-effect p-6 rounded-2xl shadow mb-6">

          <div className="flex justify-between mb-3">
            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs">
              {post.category}
            </span>
          </div>

          <p
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="text-sm font-semibold cursor-pointer hover:underline"
          >
            {post.userName}
          </p>

          <h1 className="text-2xl font-bold mt-2 mb-3">
            {post.title}
          </h1>

          <p className="text-gray-700">
            {post.message}
          </p>

        </div>

        {/* REPLIES */}
        <div className="glass-effect p-6 rounded-2xl">

          <h2 className="font-semibold mb-4">
            Replies ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <p className="text-sm text-gray-500">
              No replies yet.
            </p>
          ) : (
            replies.map((r) => (
              <div key={r.id} className="bg-white/70 p-3 rounded-lg mb-3">
                <p
                  className="text-xs text-gray-500 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${r.userId}`)}
                >
                  {r.userName}
                </p>
                <p>{r.message}</p>
              </div>
            ))
          )}

          {/* INPUT */}
          <div className="flex gap-2 mt-4">
            <input
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <button
              onClick={handleReply}
              className="bg-indigo-500 text-white px-6 rounded-lg hover:bg-indigo-600 transition"
            >
              Reply
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
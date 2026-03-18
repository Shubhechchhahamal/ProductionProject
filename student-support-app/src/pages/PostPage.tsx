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

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const adminEmail = "s.hamal2465@student.leedsbeckett.ac.uk";
  const currentUser = auth.currentUser;

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

  // ADD REPLY
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

  // DELETE POST
  const handleDeletePost = async () => {
    if (!id) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      navigate("/home");
    } catch (error) {
      console.error("Delete post failed:", error);
    }
  };

  // DELETE REPLY
  const handleDeleteReply = async (replyId: string) => {
    try {
      if (!id) return;

      await deleteDoc(doc(db, "posts", id, "replies", replyId));

      setReplies((prev) => prev.filter((r) => r.id !== replyId));

    } catch (error) {
      console.error("Delete reply failed:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] py-10 px-6"
    >

      <div className="max-w-3xl mx-auto">

        {/* POST */}
        <div className="glass-effect p-6 rounded-2xl shadow mb-6">

          <div className="flex justify-between items-start">

            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs">
              {post.category}
            </span>

            {/* 3 DOT MENU (POST) */}
            <div className="relative">

              <button
                onClick={() =>
                  setActiveMenu(activeMenu === "post" ? null : "post")
                }
                className="text-gray-500 text-xl hover:text-gray-700"
              >
                ⋯
              </button>

              {activeMenu === "post" && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-32 border z-10">

                  {(currentUser?.uid === post.userId || currentUser?.email === adminEmail) && (
                    <button
                      onClick={handleDeletePost}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  )}

                </div>
              )}

            </div>

          </div>

          <p
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="text-sm font-semibold cursor-pointer hover:underline mt-2"
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

          {replies.map((r) => (
            <div
              key={r.id}
              className="bg-white/70 p-3 rounded-lg mb-3 flex justify-between"
            >

              <div>
                <p
                  className="text-xs text-gray-500 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${r.userId}`)}
                >
                  {r.userName}
                </p>
                <p>{r.message}</p>
              </div>

              {/* 3 DOT MENU (REPLY) */}
              <div className="relative">

                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === r.id ? null : r.id)
                  }
                  className="text-gray-500 text-lg hover:text-gray-700"
                >
                  ⋯
                </button>

                {activeMenu === r.id && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-32 border z-10">

                    {(currentUser?.uid === r.userId || currentUser?.email === adminEmail) && (
                      <button
                        onClick={() => handleDeleteReply(r.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    )}

                  </div>
                )}

              </div>

            </div>
          ))}

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
              className="bg-indigo-500 text-white px-6 rounded-lg hover:bg-indigo-600"
            >
              Reply
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
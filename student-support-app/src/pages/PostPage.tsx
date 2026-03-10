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
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost(postSnap.data());
        }

        const repliesQuery = query(
          collection(db, "posts", id, "replies"),
          orderBy("createdAt", "asc")
        );

        const repliesSnap = await getDocs(repliesQuery);

        const replyList = repliesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReplies(replyList);

      } catch (error) {
        console.error("Error loading post:", error);
      }

      setLoading(false);
    };

    loadPost();
  }, [id]);

  const handleReply = async () => {
    if (!newReply.trim() || !id) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login to reply.");
        return;
      }

      // 🔹 AI moderation
      const safe = await checkAIModeration(newReply);

      if (!safe) {
        alert("Your comment contains harmful or abusive language.");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      await addDoc(collection(db, "posts", id, "replies"), {
        message: newReply,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: userData?.name || "User",
      });

      setNewReply("");

      const repliesQuery = query(
        collection(db, "posts", id, "replies"),
        orderBy("createdAt", "asc")
      );

      const repliesSnap = await getDocs(repliesQuery);

      const replyList = repliesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReplies(replyList);

    } catch (error) {
      console.error("Reply error:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm("Delete this post?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      navigate("/posts");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="p-6">Loading post...</div>;
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="min-h-screen bg-[#F8F3EF] py-10 px-6 text-[#5C4033]">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-xl shadow p-6 border">

          <div className="flex justify-between items-center mb-3">

            <span className="text-xs font-semibold bg-[#EDE0D4] px-3 py-1 rounded-full">
              {post.category}
            </span>

            {auth.currentUser?.email === adminEmail && (
              <button
                onClick={handleDelete}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            )}
          </div>

          <p
            className="text-sm font-semibold mb-2 cursor-pointer hover:underline"
            onClick={() => navigate(`/profile/${post.userId}`)}
          >
            {post.userName}
          </p>

          <h1 className="text-2xl font-semibold mb-3">
            {post.title}
          </h1>

          <p className="text-gray-700 leading-relaxed">
            {post.message}
          </p>

        </div>

        <div className="mt-8">

          <h2 className="text-lg font-semibold mb-4">
            Replies
          </h2>

          {replies.length === 0 ? (
            <p className="text-sm text-gray-500">
              No replies yet.
            </p>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-white border rounded-lg p-4">

                  <p
                    className="text-xs text-gray-500 mb-1 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${reply.userId}`)}
                  >
                    {reply.userName}
                  </p>

                  <p className="text-sm text-gray-700">
                    {reply.message}
                  </p>

                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">

            <input
              type="text"
              placeholder="Write a reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="flex-1 border rounded-lg p-3"
            />

            <button
              onClick={handleReply}
              className="bg-[#B08968] text-white px-6 rounded-lg hover:bg-[#7F5539]"
            >
              Reply
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
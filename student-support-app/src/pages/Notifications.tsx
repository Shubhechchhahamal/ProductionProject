import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Notifications() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadNotifications = async () => {

      const user = auth.currentUser;

      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list:any[] = [];

      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setNotifications(list);
      setLoading(false);

    };

    loadNotifications();

  }, []);

  if (loading) {
    return (
      <div className="p-6">Loading notifications...</div>
    );
  }

  return (

    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">

      <h1 className="text-2xl font-bold mb-6">
        Notifications
      </h1>

      {notifications.length === 0 ? (

        <p>No notifications yet.</p>

      ) : (

        <div className="space-y-3">

          {notifications.map((n) => (

            <div
              key={n.id}
              onClick={() => {

                if (n.postId) {
                  navigate(`/post/${n.postId}`);
                }

                if (n.chatId) {
                  navigate(`/chat/${n.chatId}`);
                }

              }}
              className="bg-white border rounded-lg p-4 shadow cursor-pointer hover:bg-[#EDE0D4] transition"
            >

              <p>{n.message}</p>

              {n.createdAt && (
                <p className="text-xs opacity-60 mt-1">
                  {n.createdAt.toDate().toLocaleString()}
                </p>
              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );
}
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Notifications() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];

        snapshot.forEach((d) => {
          const data = d.data();

          if (data.type === "message") return;

          list.push({ id: d.id, ...data });
        });

        setNotifications(list);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Notification listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow animate-pulse w-64 h-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">

      <div className="max-w-3xl mx-auto">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-purple-600 mb-6">
          🔔 Notifications
        </h1>

        {notifications.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 text-center">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {notifications.map((n) => (

              <div
                key={n.id}
                onClick={async () => {
                  try {
                    if (!n.read) {
                      await updateDoc(doc(db, "notifications", n.id), {
                        read: true,
                      });
                    }

                    if (n.postId) {
                      navigate(`/post/${n.postId}`);
                    }

                  } catch (err) {
                    console.error("❌ Error updating notification:", err);
                  }
                }}
                className={`bg-white p-5 rounded-xl shadow-md border transition cursor-pointer flex justify-between items-center
                  ${!n.read 
                    ? "border-l-4 border-purple-600 bg-purple-50 border-purple-200" 
                    : "border-purple-100"
                  }`}
              >

                <div>
                  <p className={`font-medium ${
                    !n.read ? "text-purple-600" : "text-gray-800"
                  }`}>
                    {n.message}
                  </p>

                  {n.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {n.createdAt.toDate().toLocaleString()}
                    </p>
                  )}
                </div>

                {/* BADGE */}
                {!n.read && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}
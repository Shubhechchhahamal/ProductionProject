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

  // ✅ LOAD NOTIFICATIONS (REAL-TIME)
  useEffect(() => {

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc") // ⚠️ remove if index error
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];

        snapshot.forEach((d) => {
          const data = d.data();

          // ❌ skip message notifications if needed
          if (data.type === "message") return;

          list.push({ id: d.id, ...data });
        });

        console.log("✅ Notifications loaded:", list.length);

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
      <div className="min-h-screen p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold gradient-text mb-6">
          🔔 Notifications
        </h1>

        {notifications.length === 0 ? (
          <div className="glass-effect p-6 rounded-2xl text-center">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {notifications.map((n) => (

              <div
                key={n.id}
                onClick={async () => {
                  try {
                    // ✅ mark as read ONLY when clicked
                    if (!n.read) {
                      await updateDoc(doc(db, "notifications", n.id), {
                        read: true,
                      });
                    }

                    // ✅ navigate
                    if (n.postId) {
                      navigate(`/post/${n.postId}`);
                    }

                  } catch (err) {
                    console.error("❌ Error updating notification:", err);
                  }
                }}
                className="glass-effect p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition flex justify-between items-center"
              >

                <div>
                  <p className="text-gray-800 font-medium">
                    {n.message}
                  </p>

                  {n.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {n.createdAt.toDate().toLocaleString()}
                    </p>
                  )}
                </div>

                {/* ✅ unread indicator */}
                {!n.read && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
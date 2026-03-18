import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc
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

      // 🔥 GET ALL NOTIFICATIONS
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid), // keep same as your DB
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list: any[] = [];
      const updates: any[] = [];

      snap.forEach((d) => {
        const data = d.data();

        // ❌ skip messages (your logic)
        if (data.type === "message") return;

        list.push({ id: d.id, ...data });

        // 🔥 MARK AS READ
        if (data.read === false) {
          updates.push(
            updateDoc(doc(db, "notifications", d.id), {
              read: true
            })
          );
        }
      });

      // 🔥 WAIT FOR ALL READ UPDATES
      await Promise.all(updates);

      // 🔥 REMOVE DUPLICATES
      const uniqueList = list.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (n) =>
              n.postId === item.postId &&
              n.message === item.message
          )
      );

      setNotifications(uniqueList);
      setLoading(false);
    };

    loadNotifications();

  }, []);

  // 🔥 LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="glass-effect p-4 rounded-xl animate-pulse h-16"></div>
          <div className="glass-effect p-4 rounded-xl animate-pulse h-16"></div>
          <div className="glass-effect p-4 rounded-xl animate-pulse h-16"></div>
        </div>
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
                onClick={() => {
                  if (n.postId) {
                    navigate(`/post/${n.postId}`);
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

                <span className="text-indigo-500 text-sm">
                  View →
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  deleteDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Inbox() {

  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadChats = async () => {

      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );

      const snapshot = await getDocs(q);

      const chatList: any[] = [];

      for (const chatDoc of snapshot.docs) {

        const data = chatDoc.data();

        const otherUserId = data.participants.find(
          (uid: string) => uid !== user.uid
        );

        const userRef = doc(db, "users", otherUserId);
        const userSnap = await getDoc(userRef);

        let name = "User";

        if (userSnap.exists()) {
          name = userSnap.data().name;
        }

        let lastMessage = "Start conversation";
        let time = "";
        let timestampValue = 0;
        let unreadCount = 0;

        const messagesRef = collection(db, "chats", chatDoc.id, "messages");

        const msgQuery = query(
          messagesRef,
          orderBy("timestamp", "desc"),
          limit(1)
        );

        const msgSnap = await getDocs(msgQuery);

        msgSnap.forEach((m) => {
          const data = m.data();
          lastMessage = data.text;

          if (data.timestamp) {
            timestampValue = data.timestamp.seconds;
            time = new Date(
              data.timestamp.seconds * 1000
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });
          }
        });

        // unread count
        const unreadQuery = query(
          messagesRef,
          where("read", "==", false)
        );

        const unreadSnap = await getDocs(unreadQuery);

        unreadSnap.forEach((m) => {
          const data: any = m.data();
          if (data.senderId !== user.uid) {
            unreadCount++;
          }
        });

        chatList.push({
          id: chatDoc.id,
          name,
          lastMessage,
          time,
          timestamp: timestampValue,
          unreadCount
        });
      }

      chatList.sort((a, b) => b.timestamp - a.timestamp);

      setChats(chatList);
      setLoading(false);
    };

    loadChats();

  }, []);

  const deleteConversation = async (chatId: string) => {

    const confirmDelete = window.confirm("Delete this conversation?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "chats", chatId));
      setChats(chats.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error("Delete chat error", err);
    }
  };

  // 🔥 LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="glass-effect h-16 rounded-xl animate-pulse"></div>
          <div className="glass-effect h-16 rounded-xl animate-pulse"></div>
          <div className="glass-effect h-16 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold gradient-text mb-6">
          💬 Inbox
        </h1>

        {chats.length === 0 ? (

          <div className="glass-effect p-6 rounded-2xl text-center">
            <p className="text-gray-500">No conversations yet</p>
          </div>

        ) : (

          <div className="space-y-4">

            {chats.map((chat) => (

              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="glass-effect p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition flex justify-between items-center"
              >

                {/* LEFT */}
                <div>
                  <p className="font-semibold text-gray-800">
                    {chat.name}
                  </p>

                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {chat.lastMessage}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">

                  {chat.unreadCount > 0 && (
                    <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}

                  <span className="text-xs text-gray-400">
                    {chat.time}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(chat.id);
                    }}
                    className="text-lg text-gray-400 hover:text-gray-700"
                  >
                    ⋮
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}
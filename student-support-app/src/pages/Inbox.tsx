import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Inbox() {

  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {

      const chatList: any[] = [];

      for (const chatDoc of snapshot.docs) {

        const data = chatDoc.data();

        // ✅ GET OTHER USER
        const otherUserId = data.participants.find(
          (id: string) => id !== user.uid
        );

        let otherUserName = "User";

        if (otherUserId) {
          const userSnap = await getDoc(doc(db, "users", otherUserId));

          if (userSnap.exists()) {
            const userData = userSnap.data();

            otherUserName =
              userData?.name ||
              userData?.displayName ||
              userData?.username ||
              "User";
          }
        }

        // ✅ GET LAST MESSAGE
        const messagesRef = collection(db, "chats", chatDoc.id, "messages");

        const lastMsgQuery = query(
          messagesRef,
          orderBy("timestamp", "desc"),
          limit(1)
        );

        const lastMsgSnap = await getDocs(lastMsgQuery);

        let lastMessage = "No messages yet";

        if (!lastMsgSnap.empty) {
          const msgData = lastMsgSnap.docs[0].data();

          if (msgData.senderId === user.uid) {
            lastMessage = "You: " + msgData.text;
          } else {
            lastMessage = msgData.text;
          }
        }

        chatList.push({
          id: chatDoc.id,
          otherUserName,
          lastMessage
        });
      }

      setChats(chatList);

    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <h2 className="text-2xl font-bold mb-6">
        💬 Messages
      </h2>

      {chats.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          No conversations yet
        </div>
      ) : (
        <div className="space-y-3">

          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="bg-white p-5 rounded-xl shadow cursor-pointer hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                {/* NAME */}
                <p className="font-semibold text-lg">
                  {chat.otherUserName}
                </p>

                {/* LAST MESSAGE */}
                <p className="text-gray-500 text-sm truncate max-w-xs">
                  {chat.lastMessage}
                </p>
              </div>

              {/* 👉 optional arrow */}
              <span className="text-gray-400">
                →
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
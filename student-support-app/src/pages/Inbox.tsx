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
  limit,
  deleteDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Inbox() {

  const [chats, setChats] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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

        const unreadCount = data.unread?.[user.uid] || 0;

        chatList.push({
          id: chatDoc.id,
          otherUserName,
          lastMessage,
          unreadCount
        });
      }

      setChats(chatList);
    });

    return () => unsubscribe();
  }, []);

  const deleteChat = async (chatId: string) => {
    const confirmDelete = confirm("Delete this chat?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "chats", chatId));
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-6 text-purple-600">
        💬 Messages
      </h2>

      {chats.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100">
          No conversations yet
        </div>
      ) : (
        <div className="space-y-3">

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`bg-white p-5 rounded-xl shadow-md border transition flex justify-between items-center relative cursor-pointer
                ${chat.unreadCount > 0 
                  ? "border-l-4 border-purple-600 bg-purple-50 border-purple-200" 
                  : "border-purple-100"
                }`}
            >
              <div onClick={() => navigate(`/chat/${chat.id}`)}>

                {/* NAME */}
                <p className={`text-lg ${
                  chat.unreadCount > 0
                    ? "font-bold text-purple-600"
                    : "font-semibold text-purple-600"
                }`}>
                  {chat.otherUserName}

                  {chat.unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </p>

                {/* LAST MESSAGE */}
                <p className="text-gray-600 text-sm truncate max-w-xs">
                  {chat.lastMessage}
                </p>
              </div>

              <button
                onClick={() =>
                  setMenuOpen(menuOpen === chat.id ? null : chat.id)
                }
                className="text-lg"
              >
                ⋮
              </button>

              {menuOpen === chat.id && (
                <div className="absolute right-4 top-12 bg-white shadow-lg rounded-lg p-2 z-50">
                  <button
                    onClick={() => deleteChat(chat.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
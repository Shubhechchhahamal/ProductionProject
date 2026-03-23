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

  //  DELETE CHAT
  const deleteChat = async (chatId: string) => {
    const confirmDelete = confirm("Delete this chat?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "chats", chatId));
    setMenuOpen(null);
  };

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
              className="bg-white p-5 rounded-xl shadow flex justify-between items-center relative"
            >
              <div onClick={() => navigate(`/chat/${chat.id}`)} className="cursor-pointer">
                <p className="font-semibold text-lg">
                  {chat.otherUserName}
                </p>

                <p className="text-gray-500 text-sm truncate max-w-xs">
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
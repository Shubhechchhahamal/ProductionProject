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
  limit
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Inbox() {

  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);

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

        const msgQuery = query(
          collection(db, "chats", chatDoc.id, "messages"),
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

        chatList.push({
          id: chatDoc.id,
          name,
          lastMessage,
          time,
          timestamp: timestampValue
        });

      }

      // Sort chats by newest message
      chatList.sort((a, b) => b.timestamp - a.timestamp);

      setChats(chatList);

    };

    loadChats();

  }, []);

  return (

    <div className="min-h-screen bg-[#F8F3EF] p-6 text-[#7F5539]">

      <h1 className="text-2xl font-bold mb-6">
        Inbox
      </h1>

      {chats.length === 0 && (
        <p>No conversations yet</p>
      )}

      {chats.map((chat) => (

        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="bg-white p-4 rounded-xl shadow mb-3 cursor-pointer hover:bg-[#EDE0D4]"
        >

          <div className="flex justify-between items-center">

            <p className="font-semibold">
              {chat.name}
            </p>

            <span className="text-xs opacity-60">
              {chat.time}
            </span>

          </div>

          <p className="text-sm opacity-60">
            {chat.lastMessage}
          </p>

        </div>

      ))}

    </div>

  );

}
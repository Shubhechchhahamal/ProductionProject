import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
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

        chatList.push({
          id: chatDoc.id,
          name
        });

      }

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

          <p className="font-semibold">
            {chat.name}
          </p>

          <p className="text-sm opacity-60">
            Tap to open conversation
          </p>

        </div>

      ))}

    </div>

  );

}
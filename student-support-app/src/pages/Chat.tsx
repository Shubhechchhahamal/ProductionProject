import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function Chat() {

  const { chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [otherUserName, setOtherUserName] = useState("");

  /* Load the other user's name */
  useEffect(() => {

    const loadUserName = async () => {

      if (!chatId) return;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) return;

      const chatData: any = chatSnap.data();

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const participants: string[] = chatData.participants || [];

      const otherUserId = participants.find(
        (uid) => uid !== currentUser.uid
      );

      if (!otherUserId) return;

      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData: any = userSnap.data();
        setOtherUserName(userData.name || "User");
      }

    };

    loadUserName();

  }, [chatId]);

  /* Load messages in realtime */
  useEffect(() => {

    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const msgs: any[] = [];

      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });

      setMessages(msgs);

    });

    return () => unsubscribe();

  }, [chatId]);

  const sendMessage = async () => {

    const user = auth.currentUser;

    if (!user || !text.trim() || !chatId) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      timestamp: serverTimestamp()
    });

    setText("");

  };

  return (

    <div className="min-h-screen bg-[#F8F3EF] p-6">

      {/* USER NAME */}
      <h2 className="text-xl font-bold mb-6 text-[#7F5539]">
        {otherUserName || "Chat"}
      </h2>

      {/* MESSAGES */}
      <div className="space-y-2 mb-6">

        {messages.map((msg) => {

          const isMe = msg.senderId === auth.currentUser?.uid;

          return (

            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-xl ${
                isMe
                  ? "bg-[#B08968] text-white ml-auto"
                  : "bg-white border"
              }`}
            >
              {msg.text}
            </div>

          );

        })}

      </div>

      {/* INPUT */}
      <div className="flex gap-2">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 p-2 border rounded-lg"
        />

        <button
          onClick={sendMessage}
          className="bg-[#7F5539] text-white px-4 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>

  );

}
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { checkAIModeration } from "../utils/aiModeration";
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

export default function Chat() {

  const { chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [otherUserName, setOtherUserName] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    const loadUser = async () => {

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
        const data: any = userSnap.data();
        setOtherUserName(data.name || "User");
      }

    };

    loadUser();

  }, [chatId]);

  useEffect(() => {

    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const list: any[] = [];

      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setMessages(list);

    });

    return () => unsubscribe();

  }, [chatId]);

  useEffect(() => {

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView();
    }

  }, [messages]);

  const sendMessage = async () => {

    const user = auth.currentUser;

    if (!user || !text.trim() || !chatId) return;

    // 🔹 AI moderation
    const safe = await checkAIModeration(text);

    if (!safe) {
      alert("Your message contains harmful or abusive language.");
      return;
    }

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: text,
      senderId: user.uid,
      timestamp: serverTimestamp()
    });

    setText("");

  };

  return (

    <div className="h-screen bg-[#F8F3EF] p-6 flex flex-col">

      <h2 className="text-xl font-bold mb-4 text-[#7F5539]">
        {otherUserName || "Chat"}
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">

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

        <div ref={bottomRef}></div>

      </div>

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
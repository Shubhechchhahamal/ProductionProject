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
  getDoc,
  deleteDoc,
  updateDoc,
  where,
  getDocs
} from "firebase/firestore";

export default function Chat() {

  const { chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserId, setOtherUserId] = useState(""); // ✅ NEW
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ LOAD USER + GET receiverId
  useEffect(() => {
    const loadUser = async () => {
      if (!chatId) return;

      const chatSnap = await getDoc(doc(db, "chats", chatId));
      if (!chatSnap.exists()) return;

      const chatData: any = chatSnap.data();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const otherUser = chatData.participants?.find(
        (uid: string) => uid !== currentUser.uid
      );

      if (!otherUser) return;

      setOtherUserId(otherUser); // ✅ IMPORTANT

      const userSnap = await getDoc(doc(db, "users", otherUser));

      if (userSnap.exists()) {
        setOtherUserName(userSnap.data().name || "User");
      }
    };

    loadUser();
  }, [chatId]);

  // ✅ LOAD MESSAGES + MARK AS READ
  useEffect(() => {
    if (!chatId) return;

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: any[] = [];

      for (const docItem of snapshot.docs) {
        const data: any = docItem.data();

        list.push({
          id: docItem.id,
          ...data
        });

        // ✅ mark as read
        if (data.receiverId === user.uid && data.read === false) {
          await updateDoc(
            doc(db, "chats", chatId, "messages", docItem.id),
            { read: true }
          );
        }
      }

      setMessages(list);
    });

    return () => unsubscribe();
  }, [chatId]);

  // ✅ MARK NOTIFICATIONS AS READ
  useEffect(() => {
    const markNotificationsRead = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false)
      );

      const snap = await getDocs(q);

      snap.forEach(async (docItem) => {
        await updateDoc(doc(db, "notifications", docItem.id), {
          read: true,
        });
      });
    };

    markNotificationsRead();
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND MESSAGE (FIXED)
  const sendMessage = async () => {
    const user = auth.currentUser;

    if (!user || !text.trim() || !chatId || !otherUserId) return;

    const safe = await checkAIModeration(text);

    if (!safe) {
      alert("Message blocked due to abusive language.");
      return;
    }

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      receiverId: otherUserId, // ✅🔥 CRITICAL FIX
      timestamp: serverTimestamp(),
      read: false
    });

    setText("");
  };

  // DELETE MESSAGE
  const unsendMessage = async (id: string) => {
    if (!chatId) return;
    await deleteDoc(doc(db, "chats", chatId, "messages", id));
  };

  // EDIT MESSAGE
  const editMessage = async (msg: any) => {
    if (!chatId) return;

    const newText = prompt("Edit message", msg.text);
    if (!newText) return;

    await updateDoc(
      doc(db, "chats", chatId, "messages", msg.id),
      { text: newText }
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] flex flex-col">

      <div className="glass-effect px-6 py-4 shadow-sm font-semibold text-lg">
        💬 {otherUserName || "Chat"}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">

        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser?.uid;

          return (
            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-2xl relative ${
                isMe
                  ? "bg-indigo-500 text-white ml-auto"
                  : "glass-effect text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      <div className="glass-effect p-4 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg border outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-500 text-white px-5 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
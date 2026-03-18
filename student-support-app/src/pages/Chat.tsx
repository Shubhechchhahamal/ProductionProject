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
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // LOAD USER
  useEffect(() => {

    const loadUser = async () => {

      if (!chatId) return;

      const chatSnap = await getDoc(doc(db, "chats", chatId));
      if (!chatSnap.exists()) return;

      const chatData: any = chatSnap.data();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const otherUserId = chatData.participants.find(
        (uid: string) => uid !== currentUser.uid
      );

      if (!otherUserId) return;

      const userSnap = await getDoc(doc(db, "users", otherUserId));

      if (userSnap.exists()) {
        setOtherUserName(userSnap.data().name || "User");
      }

    };

    loadUser();

  }, [chatId]);

  // LOAD MESSAGES
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

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // MARK AS READ
  useEffect(() => {

    const markAsRead = async () => {

      const user = auth.currentUser;
      if (!user || !chatId) return;

      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("read", "==", false)
      );

      const snap = await getDocs(q);

      snap.forEach(async (docItem) => {
        const data: any = docItem.data();

        if (data.senderId !== user.uid) {
          await updateDoc(
            doc(db, "chats", chatId, "messages", docItem.id),
            { read: true }
          );
        }
      });

    };

    markAsRead();

  }, [chatId]);

  // SEND
  const sendMessage = async () => {

    const user = auth.currentUser;

    if (!user || !text.trim() || !chatId) return;

    const safe = await checkAIModeration(text);

    if (!safe) {
      alert("Message blocked due to abusive language.");
      return;
    }

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      read: false
    });

    setText("");

  };

  const unsendMessage = async (id: string) => {
    if (!chatId) return;
    await deleteDoc(doc(db, "chats", chatId, "messages", id));
  };

  const editMessage = async (msg: any) => {
    const newText = prompt("Edit message", msg.text);
    if (!newText) return;

    await updateDoc(
      doc(db, "chats", chatId, "messages", msg.id),
      { text: newText }
    );
  };

  return (

    <div className="h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] flex flex-col">

      {/* HEADER */}
      <div className="glass-effect px-6 py-4 shadow-sm font-semibold text-lg">
        💬 {otherUserName || "Chat"}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">

        {messages.map((msg) => {

          const isMe = msg.senderId === auth.currentUser?.uid;

          return (

            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-2xl relative group ${
                isMe
                  ? "bg-indigo-500 text-white ml-auto"
                  : "glass-effect text-gray-800"
              }`}
            >

              {msg.text}

              {isMe && (

                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100">

                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === msg.id ? null : msg.id)
                    }
                  >
                    ⋮
                  </button>

                  {menuOpen === msg.id && (

                    <div className="bg-white rounded-lg shadow absolute right-0 mt-1 text-sm">

                      <button
                        onClick={() => {
                          editMessage(msg);
                          setMenuOpen(null);
                        }}
                        className="block px-3 py-1 hover:bg-gray-100 w-full text-left"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          unsendMessage(msg.id);
                          setMenuOpen(null);
                        }}
                        className="block px-3 py-1 hover:bg-gray-100 w-full text-left"
                      >
                        Unsend
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

          );

        })}

        <div ref={bottomRef}></div>

      </div>

      {/* INPUT */}
      <div className="glass-effect p-4 flex gap-3">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-500 text-white px-5 rounded-lg hover:bg-indigo-600 transition"
        >
          Send
        </button>

      </div>

    </div>

  );
}

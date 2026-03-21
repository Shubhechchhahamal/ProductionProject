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
  const [otherUserId, setOtherUserId] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [msgMenu, setMsgMenu] = useState<string | null>(null);

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

      const otherUser = chatData.participants?.find(
        (uid: string) => uid !== currentUser.uid
      );

      if (!otherUser) return;

      setOtherUserId(otherUser);

      const userSnap = await getDoc(doc(db, "users", otherUser));
      if (userSnap.exists()) {
        setOtherUserName(userSnap.data().name || "User");
      }
    };

    loadUser();
  }, [chatId]);

  // LOAD MESSAGES
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

        list.push({ id: docItem.id, ...data });

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

  // MARK NOTIFICATIONS READ
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
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
      receiverId: otherUserId,
      timestamp: serverTimestamp(),
      read: false
    });

    setText("");
  };

  // UNSEND
  const unsendMessage = async (id: string) => {
    if (!chatId) return;
    await deleteDoc(doc(db, "chats", chatId, "messages", id));
  };

  // EDIT
  const editMessage = async (msg: any) => {
    if (!chatId) return;

    const newText = prompt("Edit message", msg.text);
    if (!newText) return;

    await updateDoc(
      doc(db, "chats", chatId, "messages", msg.id),
      { text: newText }
    );
  };

  // DELETE CHAT
  const deleteChat = async () => {
    if (!chatId) return;

    const confirmDelete = confirm("Delete this chat?");
    if (!confirmDelete) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const snap = await getDocs(messagesRef);

    for (const docItem of snap.docs) {
      await deleteDoc(docItem.ref);
    }

    await deleteDoc(doc(db, "chats", chatId));

    window.location.href = "/inbox";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] flex flex-col">

      {/* HEADER */}
      <div className="glass-effect px-6 py-4 shadow-sm font-semibold text-lg flex justify-between items-center relative">
        <span>💬 {otherUserName || "Chat"}</span>

        <button onClick={() => setMenuOpen(!menuOpen)}>⋮</button>

        {menuOpen && (
          <div className="absolute right-4 top-14 bg-white shadow-lg rounded-lg p-2">
            <button
              onClick={deleteChat}
              className="text-red-500 text-sm"
            >
              Delete Chat
            </button>
          </div>
        )}
      </div>

      {/* MESSAGES */}
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

              {isMe && (
                <>
                  <button
                    onClick={() =>
                      setMsgMenu(msgMenu === msg.id ? null : msg.id)
                    }
                    className="absolute top-1 right-2 text-sm"
                  >
                    ⋮
                  </button>

                  {msgMenu === msg.id && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-2 text-black">
                      <button onClick={() => editMessage(msg)}>Edit</button>
                      <br />
                      <button onClick={() => unsendMessage(msg.id)}>Unsend</button>
                    </div>
                  )}
                </>
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
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
  updateDoc
} from "firebase/firestore";

export default function Chat() {

  const { chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    const loadUser = async () => {

      if (!chatId) return;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) return;

      const chatData:any = chatSnap.data();

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const participants:string[] = chatData.participants || [];

      const otherUserId = participants.find(
        (uid)=> uid !== currentUser.uid
      );

      if (!otherUserId) return;

      const userRef = doc(db,"users",otherUserId);
      const userSnap = await getDoc(userRef);

      if(userSnap.exists()){
        setOtherUserName(userSnap.data().name || "User");
      }

    };

    loadUser();

  },[chatId]);

  useEffect(()=>{

    if(!chatId) return;

    const q = query(
      collection(db,"chats",chatId,"messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q,(snapshot)=>{

      const list:any[] = [];

      snapshot.forEach((doc)=>{
        list.push({ id:doc.id, ...doc.data() });
      });

      setMessages(list);

    });

    return ()=>unsubscribe();

  },[chatId]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView();
  },[messages]);

  const sendMessage = async()=>{

    const user = auth.currentUser;

    if(!user || !text.trim() || !chatId) return;

    const safe = await checkAIModeration(text);

    if(!safe){
      alert("Message blocked due to abusive language.");
      return;
    }

    await addDoc(collection(db,"chats",chatId,"messages"),{
      text,
      senderId:user.uid,
      timestamp:serverTimestamp()
    });

    setText("");

  };

  const unsendMessage = async(id:string)=>{

    if(!chatId) return;

    await deleteDoc(doc(db,"chats",chatId,"messages",id));

  };

  const editMessage = async(msg:any)=>{

    const newText = prompt("Edit message",msg.text);

    if(!newText) return;

    await updateDoc(
      doc(db,"chats",chatId,"messages",msg.id),
      { text:newText }
    );

  };

  return(

    <div className="h-screen bg-[#F8F3EF] p-6 flex flex-col">

      <h2 className="text-xl font-bold mb-4 text-[#7F5539]">
        {otherUserName || "Chat"}
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">

        {messages.map((msg)=>{

          const isMe = msg.senderId === auth.currentUser?.uid;

          return(

            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-xl relative group ${
                isMe
                  ? "bg-[#B08968] text-white ml-auto"
                  : "bg-white border"
              }`}
            >

              {msg.text}

              {isMe && (

                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100">

                  <button
                    onClick={()=>setMenuOpen(
                      menuOpen === msg.id ? null : msg.id
                    )}
                  >
                    ⋮
                  </button>

                  {menuOpen === msg.id && (

                    <div className="bg-white text-black rounded shadow absolute right-0 mt-1 text-sm">

                      <button
                        onClick={()=>{
                          editMessage(msg);
                          setMenuOpen(null);
                        }}
                        className="block px-3 py-1 hover:bg-gray-100 w-full text-left"
                      >
                        Edit
                      </button>

                      <button
                        onClick={()=>{
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

      <div className="flex gap-2">

        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
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
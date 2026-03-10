import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { setDoc } from "firebase/firestore";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

export default function Profile() {

  const navigate = useNavigate();
  const { uid } = useParams();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {

  const unsubscribe = auth.onAuthStateChanged(async (user) => {

    if (!user) {
      setLoading(false);
      return;
    }

    try {

      const profileUid = uid || user.uid;

      const ref = doc(db, "users", profileUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {

        setUserData({
          uid: profileUid,
          ...snap.data()
        });

      } else {

        console.log("Creating missing profile document...");

        await setDoc(ref, {
          name: user.email || "User",
          email: user.email,
          createdAt: serverTimestamp()
        });

        const newSnap = await getDoc(ref);

        setUserData({
          uid: profileUid,
          ...newSnap.data()
        });

      }

    } catch (error) {

      console.error("Profile load error:", error);

    }

    setLoading(false);

  });

  return () => unsubscribe();

}, [uid]);

  const startChat = async () => {

    const currentUser = auth.currentUser;
    if (!currentUser || !userData) return;

    try {

      const chatsRef = collection(db, "chats");

      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.uid)
      );

      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {

        const data: any = docSnap.data();

        if (data.participants.includes(userData.uid)) {
          navigate(`/chat/${docSnap.id}`);
          return;
        }

      }

      const chat = await addDoc(chatsRef, {
        participants: [currentUser.uid, userData.uid],
        createdAt: serverTimestamp()
      });

      navigate(`/chat/${chat.id}`);

    } catch (error) {
      console.error("Error starting chat:", error);
    }

  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading profile...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        No user info found
      </div>
    );
  }

  const currentUser = auth.currentUser;

  return (

    <div className="min-h-screen bg-[#F8F3EF] p-6 text-[#7F5539]">

      {/* Back Button */}

      <button
        className="mb-6 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Profile Card */}

      <div className="bg-white max-w-xl mx-auto p-8 rounded-3xl shadow text-center">

        <h1 className="text-2xl font-bold">
          {userData.name || "Unnamed user"}
        </h1>

        <p className="mt-2">
          🌍 {userData.country || "Unknown"}
        </p>

        {userData.yearsInUK && (
          <p className="text-sm mt-1 opacity-80">
            🇬🇧 In the UK for {userData.yearsInUK}
          </p>
        )}

        {userData.languages && (
          <p className="text-sm mt-1 opacity-70">
            🗣️ {userData.languages}
          </p>
        )}

        {userData.university && (
          <p className="text-sm mt-1 opacity-70">
            🎓 {userData.university}
          </p>
        )}

        {userData.helpOffer && (
          <div className="mt-4 bg-[#EDE0D4] p-3 rounded-lg">
            <p className="text-sm font-semibold">
              I can help with
            </p>
            <p className="text-sm">
              {userData.helpOffer}
            </p>
          </div>
        )}

        {/* Edit profile button */}

        {currentUser?.uid === userData.uid && (
          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-6 bg-[#B08968] text-white px-4 py-2 rounded-lg hover:bg-[#7F5539]"
          >
            Edit Profile
          </button>
        )}

        {/* Message button */}

        {currentUser?.uid !== userData.uid && (
          <button
            onClick={startChat}
            className="mt-6 ml-3 bg-[#7F5539] text-white px-4 py-2 rounded-lg hover:bg-[#5E3B27]"
          >
            Message
          </button>
        )}

      </div>

    </div>

  );

}
import { useEffect, useState } from "react";
import Flag from "../components/Flags";
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
  };

  // 🔥 LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] flex justify-center items-center">
        <div className="glass-effect p-6 rounded-xl animate-pulse w-64 h-32"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        No user info found
      </div>
    );
  }

  const currentUser = auth.currentUser;

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-6">

      <div className="max-w-xl mx-auto">

        {/* BACK */}
        <button
          className="mb-6 text-indigo-500 hover:underline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* PROFILE CARD */}
        <div className="glass-effect p-8 rounded-2xl shadow text-center">

          <h1 className="text-2xl font-bold text-gray-800">
            {userData.name || "Unnamed user"}
          </h1>

       <div className="flex items-center justify-center gap-[2px]">
  <span>{userData.country}</span>
  {userData.country && <Flag country={userData.country} />}
</div>

          {userData.yearsInUK && (
            <p className="text-sm mt-1 text-gray-500">
             In the UK for {userData.yearsInUK}  🇬🇧
            </p>
          )}

          {userData.languages && (
            <p className="text-sm mt-1 text-gray-500">
              🗣️ {userData.languages}
            </p>
          )}

          {userData.university && (
            <p className="text-sm mt-1 text-gray-500">
              🎓 {userData.university}
            </p>
          )}

          {userData.helpOffer && (
            <div className="mt-5 bg-indigo-50 p-4 rounded-xl">
              <p className="text-sm font-semibold text-indigo-600">
                I can help with
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {userData.helpOffer}
              </p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-6 flex justify-center gap-3">

            {currentUser?.uid === userData.uid && (
              <button
                onClick={() => navigate("/edit-profile")}
                className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Edit Profile
              </button>
            )}

            {currentUser?.uid !== userData.uid && (
              <button
                onClick={startChat}
                className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Message
              </button>
            )}

          </div>

        </div>

      </div>

    </div>

  );
}
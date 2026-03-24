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

  // REPORT STATES
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // MENU STATE
  const [showMenu, setShowMenu] = useState(false);

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

  const handleReportUser = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || !uid) {
      return alert("Login first");
    }

    if (!reportReason.trim()) {
      return alert("Please enter a reason");
    }

    try {
      await addDoc(collection(db, "reports"), {
        type: "user",
        reportedUserId: uid,
        reportedBy: currentUser.uid,
        reason: reportReason,
        createdAt: serverTimestamp()
      });

      alert("User reported successfully");

      setReportReason("");
      setShowReportBox(false);

    } catch (error) {
      console.error("Report failed:", error);
    }
  };

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
    <>
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
          <div className="glass-effect p-8 rounded-2xl shadow text-center relative">

            {/* 3 DOT MENU */}
            {currentUser?.uid !== userData.uid && (
              <div className="absolute top-4 right-4">

                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-500 text-xl"
                >
                  ⋯
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-32 border">

                    <button
                      onClick={() => {
                        setShowReportBox(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Report
                    </button>

                  </div>
                )}

              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-800">
              {userData.name || "Unnamed user"}
            </h1>

            <div className="flex items-center justify-center gap-[2px]">
              <span>{userData.country}</span>
              {userData.country && <Flag country={userData.country} />}
            </div>

            {userData.yearsInUK && (
              <p className="text-sm mt-1 text-gray-500">
                In the UK for {userData.yearsInUK} 🇬🇧
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

      {/* REPORT POPUP */}
      {showReportBox && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">

            <h2 className="text-lg font-semibold mb-3">
              Report User
            </h2>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setShowReportBox(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleReportUser}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Submit
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}
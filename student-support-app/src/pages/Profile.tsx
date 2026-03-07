import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

export default function Profile() {

  const navigate = useNavigate();
  const { userId } = useParams();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = async () => {

      try {

        let uid = userId;

        // If viewing own profile
        if (!uid) {

          const currentUser = auth.currentUser;

          if (!currentUser) {
            setLoading(false);
            return;
          }

          uid = currentUser.uid;
        }

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserData(snap.data());
        }

      } catch (error) {
        console.error("Error loading profile:", error);
      }

      setLoading(false);

    };

    loadUser();

  }, [userId]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading profile...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-10 text-center">
        No user info found
      </div>
    );
  }

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
          {userData.name}
        </h1>

        <p className="mt-2">
          🌍 {userData.country}
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

        {/* Edit Button */}
        <button
          onClick={() => navigate("/edit-profile")}
          className="mt-6 bg-[#B08968] text-white px-4 py-2 rounded-lg hover:bg-[#7F5539]"
        >
          Edit Profile
        </button>

      </div>

    </div>
  );

}
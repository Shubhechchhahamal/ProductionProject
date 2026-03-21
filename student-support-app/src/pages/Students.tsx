import { useEffect, useState } from "react";
import { db, auth, rtdb } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Students() {

  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔹 LOAD STUDENTS
  useEffect(() => {

    const loadStudents = async () => {

      const snap = await getDocs(collection(db, "users"));

      const list: any[] = [];

      const currentUserId = auth.currentUser?.uid;

      snap.docs.forEach((docItem) => {

        const data: any = docItem.data();

        // ❌ REMOVE CURRENT USER
        if (docItem.id === currentUserId) return;

        list.push({
          id: docItem.id,
          name: (data.name || "Unnamed user").trim(),
          country: (data.country || "Unknown").trim(),
          languages: (data.languages || "").trim(),
          helpOffer: (data.helpOffer || "").trim(),
          role: data.role || "user"
        });

      });

      setStudents(list);

      const currentUser = auth.currentUser;

      if (currentUser?.email === "s.hamal2465@student.leedsbeckett.ac.uk") {
        setIsAdmin(true);
      }

      setLoading(false);

    };

    loadStudents();

  }, []);

  // 🔹 LISTEN TO ONLINE STATUS
  useEffect(() => {
    const statusRef = ref(rtdb, "status");

    onValue(statusRef, (snapshot) => {
      setStatuses(snapshot.val() || {});
    });
  }, []);

  // 🔹 DELETE USER (ADMIN ONLY)
  const deleteUser = async (userId: string) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this user completely?");
    if (!confirmDelete) return;

    try {

      const postsSnap = await getDocs(collection(db, "posts"));

      for (const postDoc of postsSnap.docs) {

        const postData: any = postDoc.data();

        if (postData.userId === userId) {

          const repliesSnap = await getDocs(
            collection(db, "posts", postDoc.id, "replies")
          );

          for (const replyDoc of repliesSnap.docs) {
            await deleteDoc(
              doc(db, "posts", postDoc.id, "replies", replyDoc.id)
            );
          }

          await deleteDoc(doc(db, "posts", postDoc.id));
        }
      }

      await deleteDoc(doc(db, "users", userId));

      setStudents((prev) => prev.filter((user) => user.id !== userId));

      alert("User and all their data deleted successfully");

    } catch (error) {

      console.error("Error deleting user:", error);
      alert("Failed to delete user");

    }

  };

  // 🔹 SEARCH FILTER
  const filteredStudents = students.filter((student) => {

    const query = search.toLowerCase().trim();

    return (
      student.name?.toLowerCase().includes(query) ||
      student.country?.toLowerCase().includes(query) ||
      student.languages?.toLowerCase().includes(query) ||
      student.helpOffer?.toLowerCase().includes(query)
    );

  });

  // 🔹 LOADING STATE
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading students...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4] p-4">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-600">
          👥 Students Joined ({filteredStudents.length})
        </h1>
      </div>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto mt-4">
        <input
          type="text"
          placeholder="Search students by name, country, language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm"
        />
      </div>

      {/* STUDENT LIST */}
      <div className="max-w-4xl mx-auto mt-6 space-y-5">

        {filteredStudents.map((student) => {

          const isOnline = statuses[student.id]?.state === "online";

          return (
            <div
              key={student.id}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition"
            >

              <div
                onClick={() => navigate(`/profile/${student.id}`)}
                className="cursor-pointer"
              >
                <p className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                  {student.name}

                  {/* 🟢 ONLINE STATUS */}
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {student.country}
                </p>
              </div>

              {/* ❗ ADMIN ONLY */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUser(student.id);
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete User
                </button>
              )}

            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
            No students match your search.
          </div>
        )}

      </div>

    </div>
  );
}
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
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email === "s.hamal2465@student.leedsbeckett.ac.uk") {
        setIsAdmin(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {

      const usersSnap = await getDocs(collection(db, "users"));
      const reportsSnap = await getDocs(collection(db, "reports"));

      const currentUserId = auth.currentUser?.uid;

      const list = usersSnap.docs
        .filter(docItem => docItem.id !== currentUserId)
        .map(docItem => {
          const data: any = docItem.data();
          return {
            id: docItem.id,
            name: (data.name || "Unnamed user").trim(),
            country: (data.country || "Unknown").trim(),
            languages: (data.languages || "").trim(),
            helpOffer: (data.helpOffer || "").trim()
          };
        });

      setStudents(list);

      setReports(
        reportsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const statusRef = ref(rtdb, "status");
    onValue(statusRef, (snapshot) => {
      setStatuses(snapshot.val() || {});
    });
  }, []);

  const deleteUser = async (userId: string) => {

    if (!window.confirm("Delete this user and all their data?")) return;

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

      setStudents(prev => prev.filter(u => u.id !== userId));

      alert("User deleted");

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const dismissReport = async (reportId: string) => {
    await deleteDoc(doc(db, "reports", reportId));
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.languages.toLowerCase().includes(q) ||
      s.helpOffer.toLowerCase().includes(q)
    );
  });

  const reportedUsers = reports
    .filter(r => r.type === "user")
    .map(r => {
      const user = students.find(s => s.id === r.reportedUserId);
      if (!user) return null;
      return {
        ...user,
        reason: r.reason,
        reportId: r.id
      };
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow animate-pulse w-64 h-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100 text-center">
          <h1 className="text-3xl font-bold text-purple-600">
            👥 Students ({filteredStudents.length})
          </h1>
        </div>

        {/* REPORTED USERS */}
        {isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100 space-y-4">

            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🚨 Reported Users
              <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {reportedUsers.length}
              </span>
            </h2>

            {reportedUsers.length === 0 && (
              <p className="text-gray-400 text-sm">
                No reports at the moment.
              </p>
            )}

            {reportedUsers.map((user: any) => (
              <div
                key={user.id}
                className="border-l-4 border-red-500 bg-red-50 p-4 rounded-xl"
              >
                <div className="flex justify-between items-start">

                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {user.reason}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => dismissReport(user.reportId)}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Dismiss
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-purple-100 shadow-sm focus:ring-2 focus:ring-purple-500"
        />

        {/* STUDENTS */}
        <div className="space-y-4">

          {filteredStudents.map(student => {

            const isOnline = statuses[student.id]?.state === "online";

            return (
              <div
                key={student.id}
                className="bg-white p-5 rounded-2xl shadow-md border border-purple-100 hover:shadow-lg transition"
              >
                <div
                  onClick={() => navigate(`/profile/${student.id}`)}
                  className="cursor-pointer"
                >
                  <p className="font-semibold flex items-center gap-2">
                    {student.name}
                    <span className={`h-3 w-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
                  </p>

                  <p className="text-sm text-gray-500">
                    {student.country}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => deleteUser(student.id)}
                    className="mt-3 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete User
                  </button>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
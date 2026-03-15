import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Students() {

  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const loadStudents = async () => {

      const snap = await getDocs(collection(db, "users"));

      const list: any[] = [];

      snap.docs.forEach((docItem) => {

        const data: any = docItem.data();

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

      // detect if current user is admin
     const currentUser = auth.currentUser;

      if (currentUser?.email === "s.hamal2465@student.leedsbeckett.ac.uk") {
      setIsAdmin(true);
     }

      setLoading(false);

    };

    loadStudents();

  }, []);


  const deleteUser = async (userId: string) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) return;

    try {

      await deleteDoc(doc(db, "users", userId));

      // update UI
      setStudents((prev) => prev.filter((user) => user.id !== userId));

      alert("User deleted successfully");

    } catch (error) {

      console.error("Error deleting user:", error);
      alert("Failed to delete user");

    }

  };


  const filteredStudents = students.filter((student) => {

    const query = search.toLowerCase().trim();

    return (
      student.name?.toLowerCase().includes(query) ||
      student.country?.toLowerCase().includes(query) ||
      student.languages?.toLowerCase().includes(query) ||
      student.helpOffer?.toLowerCase().includes(query)
    );

  });


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading students...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">

      <h1 className="text-3xl font-bold mb-6">
        Students Joined ({filteredStudents.length})
      </h1>

      <div className="mb-8">

        <input
          type="text"
          placeholder="Search students by name, country, language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-[#D6CCC2] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
        />

      </div>

      <div className="space-y-4">

        {filteredStudents.map((student) => (

          <div
            key={student.id}
            className="bg-[#EDE0D4] p-6 rounded-2xl shadow hover:bg-[#D6CCC2] hover:shadow-lg transition"
          >

            <div
              onClick={() => navigate(`/profile/${student.id}`)}
              className="cursor-pointer"
            >

              <p className="font-semibold text-lg">
                {student.name}
              </p>

              <p className="text-sm opacity-70">
                {student.country}
              </p>

            </div>

            {isAdmin && (

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteUser(student.id);
                }}
                className="mt-3 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete User
              </button>

            )}

          </div>

        ))}

        {filteredStudents.length === 0 && (

          <p className="text-center text-sm opacity-70 mt-6">
            No students match your search.
          </p>

        )}

      </div>

    </div>

  );

}
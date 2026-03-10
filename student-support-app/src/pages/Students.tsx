import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Students() {

  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {

    const loadStudents = async () => {

      const snap = await getDocs(collection(db, "users"));

      const list: any[] = [];

      snap.docs.forEach((doc) => {

        const data: any = doc.data();

        list.push({
          id: doc.id,
          name: (data.name || "Unnamed user").trim(),
          country: (data.country || "Unknown").trim(),
          languages: (data.languages || "").trim(),
          helpOffer: (data.helpOffer || "").trim()
        });

      });

      setStudents(list);
      setLoading(false);

    };

    loadStudents();

  }, []);


  // Filter students based on search input
  const filteredStudents = students.filter((student) => {

    const query = search.toLowerCase().trim();

    return (
      student.name?.toLowerCase().trim().includes(query) ||
      student.country?.toLowerCase().trim().includes(query) ||
      student.languages?.toLowerCase().trim().includes(query) ||
      student.helpOffer?.toLowerCase().trim().includes(query)
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

      {/* Search bar */}

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
            onClick={() => navigate(`/profile/${student.id}`)}
            className="bg-[#EDE0D4] p-6 rounded-2xl shadow hover:bg-[#D6CCC2] hover:shadow-lg cursor-pointer transition"
          >

            <p className="font-semibold text-lg">
              {student.name}
            </p>

            <p className="text-sm opacity-70">
              {student.country}
            </p>

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
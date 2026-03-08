import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Students() {

  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadStudents = async () => {

      const snap = await getDocs(collection(db, "users"));

      const list: any[] = [];

      snap.docs.forEach((doc) => {

        const data: any = doc.data();

        list.push({
          id: doc.id,
          name: data.name || "Unnamed user",
          country: data.country || "Unknown"
        });

      });

      setStudents(list);
      setLoading(false);

    };

    loadStudents();

  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#7F5539]">
        Loading students...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#F8F3EF] text-[#7F5539] p-6">

      <h1 className="text-3xl font-bold mb-8">
        Students Joined ({students.length})
      </h1>

      <div className="space-y-4">

        {students.map((student) => (

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

      </div>

    </div>

  );

}
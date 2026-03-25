import Navbar from "../components/Navbar";

export default function Support() {
  const supportItems = [
    {
      title: "My Hub",
      desc: "Access support, skills, appointments, events, and university services in one place",
      link: "https://myhub.leedsbeckett.ac.uk",
    },
    {
      title: "Academic Support",
      desc: "Study skills, writing, research help",
      link: "https://libguides.leedsbeckett.ac.uk/home",
    },
    {
      title: "Careers & Jobs",
      desc: "CV help, jobs, placements, graduate roles",
      link: "https://www.leedsbeckett.ac.uk/student-information/careers-and-opportunities/",
    },
    {
      title: "Wellbeing & Mental Health",
      desc: "Counselling and mental health support",
      link: "https://www.leedsbeckett.ac.uk/student-information/student-wellbeing/",
    },
    {
      title: "International Student Support",
      desc: "Visa, immigration, living in the UK",
      link: "https://www.leedsbeckett.ac.uk/student-information/international-students/",
    },
    {
      title: "Money & Funding",
      desc: "Scholarships and financial advice",
      link: "https://www.leedsbeckett.ac.uk/student-information/money-advice/funding-from-leeds-beckett/",
    },
    {
      title: "Disability & Inclusion",
      desc: "Support for disabilities and inclusive learning",
      link: "https://www.leedsbeckett.ac.uk/student-information/disability-advice/",
    },
    {
      title: "Students' Union",
      desc: "Societies, events, and student support",
      link: "https://www.leedsbeckettsu.co.uk",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Student support at Leeds Beckett University
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {supportItems.map((item, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {item.title}
              </h2>

              <p className="text-gray-600 mb-4">
                {item.desc}
              </p>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 font-medium hover:underline"
              >
                Visit Page →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
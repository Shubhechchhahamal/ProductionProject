import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-800">
      {/* LANDING NAVBAR */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-purple-600 whitespace-nowrap">
            HomeAway
          </h1>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex gap-6 items-center">
            <a
              href="#features"
              className="text-gray-600 hover:text-purple-600 font-medium"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-gray-600 hover:text-purple-600 font-medium"
            >
              About
            </a>

            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-purple-600 font-medium"
            >
              How It Works
            </a>

            <Link
              to="/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Join Now
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <div className="md:hidden">
            <Link
              to="/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 md:px-16 py-12 md:py-16 bg-gradient-to-br from-purple-50 to-blue-50 text-center">
        <img
          src="/homeaway-logo.png"
          className="h-24 w-24 md:h-28 md:w-28 mb-8 rounded-full object-cover"
          alt="HomeAway logo"
        />

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 text-gray-900">
            Your community,
            <span className="block text-purple-600">away from home</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect with fellow international students for real advice on housing,
            jobs, culture, and everything in between 💜
          </p>

          <Link
            to="/login"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          <img
            src="/students1.jpg"
            alt="Students 1"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-md object-cover"
          />
          <img
            src="/students2.jpg"
            alt="Students 2"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-md object-cover sm:-translate-y-4"
          />
          <img
            src="/students3.jpg"
            alt="Students 3"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-md object-cover"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-24 px-5 sm:px-6 text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything you need to settle in
        </h2>

        <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
          From finding a flat to making friends. HomeAway helps you navigate life in the UK.
        </p>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {[
              {
                icon: "🛡️",
                title: "Safe Space",
                desc: "AI-powered moderation keeps conversations respectful and positive."
              },
              {
                icon: "👤",
                title: "Verified Profiles",
                desc: "Sign up with your university email to build trust."
              },
              {
                icon: "🔍",
                title: "Find Help by Topic",
                desc: "Housing, jobs, events and more."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 md:gap-8 flex-wrap">
            {[
              {
                icon: "💬",
                title: "Direct Messaging",
                desc: "Connect instantly with other students."
              },
              {
                icon: "📅",
                title: "Community Events",
                desc: "Discover meetups and social events."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 transition w-full max-w-sm"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY I BUILT HOMEAWAY */}
      <section
        id="about"
        className="py-28 px-5 sm:px-6 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-10 md:p-12 text-center border border-gray-100">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why I built HomeAway
            </h2>

            <p className="text-gray-600 leading-relaxed text-lg">
              Moving from Nepal to the UK as an international student, I realised that
              many of the challenges weren’t academic, they were everyday things.
              Understanding how things work, finding reliable information, and adjusting
              to a completely new environment took time.
              <br /><br />
              Most of it was figured out through trial and error. I noticed that many
              students go through the same process, often without a simple way to learn
              from others who&apos;ve already experienced it.
              <br /><br />
              HomeAway was created as a space where students can share experiences, ask
              questions, and support each other through that transition.
            </p>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="italic text-gray-800 text-lg">
                Shubhechchha Hamal
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Founder, HomeAway
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-24 px-5 sm:px-6 bg-gray-50 text-center">
        <p className="text-sm text-orange-500 mb-2">SIMPLE PROCESS</p>

        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          How HomeAway works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { num: "01", title: "Sign up", desc: "Use your university email." },
            { num: "02", title: "Explore", desc: "Browse topics or ask questions." },
            { num: "03", title: "Connect", desc: "Message students and build network." }
          ].map((step, i) => (
            <div key={i} className="px-2">
              <div className="text-5xl text-gray-300 font-bold mb-2">{step.num}</div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-gray-500 mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to find your community?
        </h2>

        <p className="mb-6">
          Join hundreds of students already helping each other.
        </p>

        <Link
          to="/signup"
          className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-medium shadow hover:scale-105 transition"
        >
          Join HomeAway
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-500 px-4">
        © 2026 HomeAway. Built for students by a student.
      </footer>
    </div>
  );
}
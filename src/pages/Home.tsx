import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <section className="flex flex-col items-center text-center px-6 py-20">

        <h1 className="text-5xl font-bold text-gray-900 max-w-3xl">
          Build Your Professional Resume
          <span className="text-blue-600">
            {" "}With AI
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          Create beautiful resumes, track job applications,
          and improve your career opportunities with CareerFlow.
        </p>

        <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg">
          Create Resume
        </button>

      </section>
        <section className="px-8 py-16">

  <h2 className="text-3xl font-bold text-center">
    Everything You Need For Your Career
  </h2>


  <div className="grid md:grid-cols-3 gap-8 mt-10">


    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-bold">
        AI Resume Builder
      </h3>

      <p className="mt-3 text-gray-600">
        Create professional resumes with smart suggestions.
      </p>
    </div>


    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-bold">
        Job Tracker
      </h3>

      <p className="mt-3 text-gray-600">
        Manage your job applications in one place.
      </p>
    </div>


    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-bold">
        Career Insights
      </h3>

      <p className="mt-3 text-gray-600">
        Improve your resume and career strategy.
      </p>
    </div>


  </div>

</section>
      <Footer />

    </div>
  )
}

export default Home
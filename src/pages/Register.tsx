import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Frontend validation
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // If backend returns an error
      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // Registration successful
      navigate("/login");

    } catch (error) {

      console.error(error);

      setError("Unable to connect to the server.");

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50">

      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-blue-600"
          >
            CareerFlow
          </Link>

          <p className="text-sm text-slate-500">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

        </div>
      </header>


      {/* Main Content */}
      <main className="flex h-[calc(100vh-64px)] items-center justify-center px-5 py-5">

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-5 text-center">

            <div className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Create your CareerFlow account
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
              Start your career journey
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Build resumes, track applications, and keep your career progress organized.
            </p>

          </div>


          {/* Register Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50">

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">

                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                  !
                </div>

                <p>
                  {error}
                </p>

              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Full Name */}
              <div>

                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Password */}
              <div>

                <div className="mb-1.5 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <span className="text-xs text-slate-400">
                    Min. 8 characters
                  </span>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/40 px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"
                }
              </button>

            </form>


            {/* Sign In */}
            <div className="mt-5 border-t border-slate-100 pt-4">

              <p className="text-center text-sm text-slate-500">
                Already using CareerFlow?{" "}

                <Link
                  to="/login"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>

            </div>

          </div>


          {/* Bottom Text */}
          <p className="mt-4 text-center text-xs text-slate-400">
            Your career workspace, all in one place.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Register;
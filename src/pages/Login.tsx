import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      const message = "Please enter your email and password.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || "Login failed.";
        setError(message);
        toast.error(message);
        return;
      }

      if (!data?.token || !data?.user) {
        throw new Error("The server returned an invalid login response.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Signed in successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error &&
        error.message !== "Failed to fetch"
          ? error.message
          : "Unable to connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-2xl font-bold tracking-tight text-blue-600">
            CareerFlow
          </Link>

          <p className="text-sm text-slate-500">
            New to CareerFlow?{" "}
            <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Create account
            </Link>
          </p>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-5">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <div className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Welcome back to CareerFlow
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
              Sign in to your account
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Continue managing your resumes, job applications, and career progress.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50">
            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                  !
                </div>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-xs text-slate-400">Secure login</span>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-center text-sm text-slate-500">
                Don&apos;t have a CareerFlow account?{" "}
                <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Your career workspace, all in one place.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
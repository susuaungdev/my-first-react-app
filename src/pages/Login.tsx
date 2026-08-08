import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();

        setError("");


        // Frontend validation
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                setError(data.message || "Login failed.");

                return;
            }


            // Store JWT token
            localStorage.setItem(
                "token",
                data.token
            );


            // Store user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Go to dashboard
            navigate("/dashboard");


        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-2">
                    Welcome Back
                </h1>

                <p className="text-gray-500 text-center mb-6">
                    Login to your CareerFlow account
                </p>


                {error && (

                    <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={handleLogin}
                    className="space-y-5"
                >

                    <div>

                        <label className="block mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="you@example.com"
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <div>

                        <label className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                <p className="mt-6 text-center text-gray-600">

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>

    );
}


export default Login;
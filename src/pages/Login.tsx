import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");


  function handleSubmit(e: React.FormEvent) {

    e.preventDefault();


    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }


    setError("");


    console.log({
      email,
      password
    });

  }


  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center">


      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">


        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>


        <p className="text-center text-gray-500 mt-2">
          Login to your CareerFlow account
        </p>



        {error && (
          <p className="text-red-500 text-center mt-4">
            {error}
          </p>
        )}



        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >


          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />



          <div className="relative">


            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />


            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-blue-600"
            >

              {showPassword ? "Hide" : "Show"}

            </button>


          </div>



          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>


        </form>


      </div>


    </div>

  )

}


export default Login;
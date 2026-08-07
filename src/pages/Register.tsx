import { useState } from "react";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");


  function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }


    setError("");

    console.log({
      name,
      email,
      password
    });

  }


  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">


        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>


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
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />



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
            Register
          </button>


        </form>


      </div>


    </div>

  )
}


export default Register;
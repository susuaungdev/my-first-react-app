function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-blue-600">
        CareerFlow
      </h1>

      <div className="flex gap-6">
        <a href="/" className="text-gray-700 hover:text-blue-600">
          Home
        </a>

        <a href="/login" className="text-gray-700 hover:text-blue-600">
          Login
        </a>

        <a href="/register">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            Get Started
          </button>
        </a>
      </div>
    </nav>
  )
}

export default Navbar
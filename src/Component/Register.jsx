import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
  const [formdata, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: formdata.email,
        password: formdata.password,
      })
    );

    Swal.fire({
      title: "Register Berhasil!",
      text: "Silakan login dengan akunmu.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      navigate("/Login");
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100">
      <div className="p-8 rounded-lg shadow-md w-full max-w-sm bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <h1 className="text-2xl text-center mb-6 font-bold">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none w-full py-2 px-0 text-gray-700 leading-tight"
              id="name"
              type="text"
              name="name"
              value={formdata.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none w-full py-2 px-0 text-gray-700 leading-tight"
              id="email"
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-4 relative">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none w-full py-2 pr-10 px-0 text-gray-700 leading-tight"
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              aria-describedby="togglePassword"
            />

            <button
              type="button"
              id="togglePassword"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-9 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-7 1-2.8 4-5 8-6.1M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 p-30 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Daftar
            </button>

            <p className="text-sm text-gray-700 font-semibold">
              Sudah punya akun?{" "}
              <Link
                to="/Login"
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;

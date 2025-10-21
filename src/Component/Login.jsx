import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
  const [formdata, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      storedUser &&
      storedUser.email === formdata.email &&
      storedUser.password === formdata.password
    ) {
      Swal.fire({
        title: "Login Berhasil!",
        icon: "success",
      }).then(() => {
        navigate("/Dashboard");
      });
    } else {
      Swal.fire({
        title: "Login Gagal!",
        text: "Nama, Email atau password salah!",
        icon: "error",
      });
    }
  };

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-white to-blue-200">
        <div className="p-8 rounded-lg shadow-md w-full max-w-sm bg-gradient-to-r from-blue-100 via-white to-blue-100">
          <h1 className="text-2xl text-center mb-6 font-bold">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="shadow appearance-none rounded-full w-full py-2 px-4 text-gray-700 focus:outline-none focus:shadow-outline"
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
                className="shadow appearance-none rounded-full w-full py-2 px-4 text-gray-700 focus:outline-none focus:shadow-outline"
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
              <div className="relative">
                <input
                  className="shadow appearance-none rounded-full w-full py-2 px-4 pr-10 text-gray-700 focus:outline-none focus:shadow-outline"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formdata.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  aria-describedby="togglePassword"
                />

                {/* Tombol Mata */}
                <button
                  type="button"
                  id="togglePassword"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    // Ikon mata tertutup
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
            </div>

            <div className="flex flex-col items-center gap-2 justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Daftar
              </button>

              <p className="text-sm text-gray-700 font-semibold">
                Belum punya akun?{" "}
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

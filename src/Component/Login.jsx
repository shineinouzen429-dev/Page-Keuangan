import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
        text: "Email atau password salah!",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200">
      <div className="w-full max-w-sm p-8 rounded-3xl shadow-xl backdrop-blur-md bg-white/60 border border-white/40">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 tracking-wide">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">
              Email
            </label>
            <input
              className="w-full py-2.5 px-4 rounded-xl bg-white/70 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="Masukkan Email"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-1 font-semibold">
              Password
            </label>

            <input
              className="w-full py-2.5 px-4 pr-12 rounded-xl bg-white/70 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-10 text-gray-600 hover:text-gray-900"
            >
              {showPassword ? (
                <i className="ri-eye-line text-xl"></i>
              ) : (
                <i className="ri-eye-off-line text-xl"></i>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-full shadow-md"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-700 font-medium pt-2">
            Belum Punya Akun?{" "}
            <Link to="/" className="text-blue-700 font-bold hover:underline">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

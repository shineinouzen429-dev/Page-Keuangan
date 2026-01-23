import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function Login() {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ HANDLE SUBMIT BARU (PAKAI BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/login",
        {
          email: formdata.email,
          password: formdata.password,
        }
      );

      Swal.fire({
        title: "Login Berhasil!",
        text: response.data.message,
        icon: "success",
      }).then(() => {
        navigate("/Dashboard");
      });
    } catch (error) {
  console.error(error);

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
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="Masukkan Email"
              required
              className="w-full py-2.5 px-4 rounded-xl bg-white/70 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-1 font-semibold">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              required
              className="w-full py-2.5 px-4 pr-12 rounded-xl bg-white/70 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-10 text-gray-600 hover:text-gray-900"
            >
              <i
                className={`${
                  showPassword ? "ri-eye-line" : "ri-eye-off-line"
                } text-xl`}
              ></i>
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

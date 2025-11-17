import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formdata.password !== formdata.confirmPassword) {
      return Swal.fire({
        title: "Password Tidak Sama!",
        text: "Password dan konfirmasi password harus cocok.",
        icon: "error",
      });
    }

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200">
      <div className="w-full max-w-sm p-8 rounded-3xl shadow-xl backdrop-blur-md bg-white/60 border border-white/40">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 tracking-wide">
          Daftar Akun
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
          <div className="relative">
            <label className="block text-gray-700 mb-1 font-semibold">
              Konfirmasi Password
            </label>

            <input
              className="w-full py-2.5 px-4 pr-12 rounded-xl bg-white/70 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formdata.confirmPassword}
              onChange={handleChange}
              placeholder="Konfirmasi Password"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-4 top-10 text-gray-600 hover:text-gray-900"
            >
              {showConfirm ? (
                <i className="ri-eye-line text-xl"></i>
              ) : (
                <i className="ri-eye-off-line text-xl"></i>
              )}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-full shadow-md"
            >
              Daftar
            </button>
          </div>

          <p className="text-center text-sm text-gray-700 font-medium pt-2">
            Sudah punya akun?{" "}
            <Link
              to="/Login"
              className="text-blue-700 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

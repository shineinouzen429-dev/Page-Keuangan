import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function Login() {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Login Berhasill!",
      icon: "success",
      draggable: true,
    }).then(() => {
      navigate("/D");
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit}>
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
              type="text"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none w-full py-2 px-0 text-gray-700 leading-tight"
              id="password"
              type="text"
              name="password"
              value={formdata.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="flex flex-col items-center gap-2 justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Daftar
            </button>
            <button>
              <Link
                to="/"
                className="inline-block align-baseline text-black hover:text-gray-600 font-bold text-sm"
              >
                Belum punya akun? Daftar
              </Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

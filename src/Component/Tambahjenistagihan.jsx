import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Tambahjenistagihan() {
  const [formData, setFormData] = useState({
    type_bill: "",
    harga: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/jenistagihan",
        formData
      );

      console.log("Respon server:", response.data);
      Swal.fire({
        title: "Yatta, Berhasil",
        icon: "success",
        draggable: true,
      });

      setFormData({
        ntype_bill: "",
        harga: "",
      });

      navigate("/J");
    } catch (error) {
      console.error("Error saat menambahkan data:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat">
      <div className="mr-12 bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Tambah data</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
           <label
              htmlFor="type_bill"
              className="block text-sm font-bold mb-2"
            >
              Jenis tagihan{" "}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="type_bill"
              name="type_bill"
              type="text"
              placeholder="Masukkan Jenis Tagihan"
              value={formData.type_bill}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="harga"
            >
              Harga
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="harga"
              type="text"
              name="harga"
              value={formData.harga}
              placeholder="Masukkan Harga"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {loading ? "Loading..." : "Tambah"}
            </button>

            <Link
              to="/J"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Tambahjenistagihan;

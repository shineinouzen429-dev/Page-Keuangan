import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Tambahtagihan () {
  const [formData, setFormData] = useState({
    name:"",
    jenis_tagihan:"",
    jumlah:"",
    status:"",
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
      const response = await axios.post("http://localhost:5000/tagihan", formData);

      console.log("Respon server:", response.data);
      Swal.fire({
        title: "Yatta, Berhasil",
        icon: "success",
        draggable: true,
      });

     
      setFormData({
       name:"",
       jenis_tagihan:"",
       jumlah:"",
       status:"",
      });

      navigate("/Tagihan"); 
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
     <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
    >
      <div className="mr-12 bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Tambah Data</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nama
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama"
              required
            />
          </div>
          <div className="mb-4">
           <label className="block mb-2 font-semibold">Jenis Tagihan</label>
            <select
              className="border rounded w-full py-2 px-3 mb-4"
              name="jenis_tagihan"
              value={formData.jenis_tagihan}
              onChange={handleChange}
              required
            >
              <option value="">-- Pilih Jenis Tagihan --</option>
              <option value="SPP">SPP</option>
              <option value="Uang Gedung">Uang Gedung</option>
              <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
              <option value="Seragam">Seragam</option>
            </select>
          </div>

          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jumlah">
              Jumlah
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="jumlah"
              type="text"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              placeholder="Masukkan jumlah"
              required
            />
          </div>          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status pembayaran
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="status"
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Masukkan status"
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
              to="/Tagihan"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Tambahtagihan;

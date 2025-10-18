import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import Swal from "sweetalert2";

function Edittagihan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    jenis_tagihan: "",
    jumlah: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);

  // === 🔹 Format ke Rupiah ===
  const formatRupiah = (angka) => {
    if (!angka) return "";
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // === 🔹 Ambil data awal dari server ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/tagihan/${id}`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        // ketika data dari server didapat, ubah jumlah jadi format rupiah
        setFormData({
          ...data,
          jumlah: formatRupiah(data.jumlah),
        });
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal mengambil data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // === 🔹 Handle input ===
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jumlah") {
      // Hapus semua karakter selain angka
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, jumlah: formatRupiah(numericValue) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // === 🔹 Submit update ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Yakin mau disimpan?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // kirim ke backend tanpa "Rp " dan titik
          const payload = {
            ...formData,
            jumlah: parseInt(formData.jumlah.replace(/[^0-9]/g, "")),
          };

          await axios.put(`http://localhost:5000/tagihan/${id}`, payload);

          Swal.fire("Saved!", "Data berhasil diperbarui.", "success");
          navigate("/Tagihan");
        } catch (err) {
          console.error("Gagal mengupdate data:", err);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Gagal update data.",
          });
        }
      }
    });
  };

  if (loading) return <p className="text-center mt-10">Loading data...</p>;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-lg bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Data</h1>
        <form onSubmit={handleSubmit} className="p-6">
          {/* Nama */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-bold mb-2">
              Nama
            </label>
            <input
              className="border-0 border-b-2 border-black focus:border-black focus:outline-none w-full py-2 px-0"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Jenis Tagihan */}
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
              <option value="Buku Paket">Buku Paket</option>
            </select>
          </div>

          {/* Jumlah */}
          <div className="mb-4">
            <label htmlFor="jumlah" className="block text-sm font-bold mb-2">
              Jumlah
            </label>
            <input
              className="border-0 border-b-2 border-black focus:border-black focus:outline-none w-full py-2 px-0"
              id="jumlah"
              name="jumlah"
              type="text"
              value={formData.jumlah}
              onChange={handleChange}
              required
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Status Pembayaran</label>
            <select
              className="border rounded w-full py-2 px-3 mb-4"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">-- Status Pembayaran --</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum lunas">Belum lunas</option>
            </select>
          </div>

          {/* Tombol */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-950 text-white font-bold py-2 px-4 rounded"
            >
              Update Data
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edittagihan;

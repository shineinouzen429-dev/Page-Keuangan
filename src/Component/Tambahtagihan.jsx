import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Tambahtagihan() {
  const [formData, setFormData] = useState({
    name: "",
    jenis_tagihan: "",
    jumlah: "",
    status: "Belum lunas",
  });

  const [jenisTagihanList, setJenisTagihanList] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJenisTagihan = async () => {
      try {
        const response = await axios.get("http://localhost:5000/jenistagihan");

        const aktifOnly = response.data.filter(
          (item) => item.masih?.toLowerCase() === "aktif"
        );

        setJenisTagihanList(aktifOnly);
        setActiveCount(aktifOnly.length); 
      } catch (error) {
        console.error("Gagal mengambil data jenis tagihan:", error);
        Swal.fire("Error!", "Tidak bisa mengambil data jenis tagihan", "error");
      }
    };
    fetchJenisTagihan();
  }, []);

  const formatRupiah = (angka) => {
    if (!angka) return "";
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jumlah") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, jumlah: numericValue });
      e.target.value = formatRupiah(numericValue);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/tagihan", {
        ...formData,
        jumlah: parseInt(formData.jumlah),
      });

      Swal.fire({
        title: "Yatta, Berhasil!",
        icon: "success",
      });

      navigate("/Tagihan");
    } catch (error) {
      console.error("Error saat menambahkan data:", error);
      Swal.fire("Oops...", "Gagal menambahkan data!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat">
      <div className="mr-12 bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Tambah Tagihan</h1>
        <p className="text-center text-gray-600 mb-6">
          Jenis tagihan aktif: <span className="font-semibold">{activeCount}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nama
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
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
              <option value="">-- Pilih Jenis Tagihan (Aktif) --</option>
              {jenisTagihanList.map((item) => (
                <option key={item.id} value={item.type_bill}>
                  {item.type_bill}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Jumlah
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
              type="text"
              name="jumlah"
              onChange={handleChange}
              placeholder="Masukkan jumlah"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              {loading ? "Loading..." : "Tambah"}
            </button>

            <Link
              to="/Tagihan"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Tambahtagihan;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const RekapPresensi = () => {
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [rekap, setRekap] = useState([]);
  const [rekapFiltered, setRekapFiltered] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const [filterNama, setFilterNama] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");

  const showMessage = (text, type = "info") => {
    Swal.fire({ text, icon: type, timer: 2000, showConfirmButton: false });
  };

  const fmtTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  useEffect(() => {
    fetchRekap(filterDate);
  }, []);

  const fetchRekap = async (date) => {
    setLoadingRekap(true);
    try {
      const res = await axios.get(`${API_BASE}/presensi`, {
        params: { tanggal: date },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.presensi || [];

      const merged = {};

      list.forEach((row) => {
        const key = row.nomor_unik;

        if (!merged[key]) {
          merged[key] = {
            ...row,
            jam_masuk: row.jam_masuk || null,
            jam_pulang: row.jam_pulang || null,
          };
        } else {
          if (row.jam_masuk) merged[key].jam_masuk = row.jam_masuk;
          if (row.jam_pulang) merged[key].jam_pulang = row.jam_pulang;
        }
      });

      const finalList = Object.values(merged).map((r) => ({
        ...r,
        jamMasukFormatted: fmtTime(r.jam_masuk),
        jamPulangFormatted: fmtTime(r.jam_pulang),
        key: r.nomor_unik,
      }));

      setRekap(finalList);
      setRekapFiltered(finalList);
    } catch {
      showMessage("Gagal memuat rekap presensi", "error");
    } finally {
      setLoadingRekap(false);
    }
  };

  useEffect(() => {
    let filtered = [...rekap];

    if (filterNama.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.nama.toLowerCase().includes(filterNama.toLowerCase())
      );
    }

    if (filterKategori !== "Semua") {
      filtered = filtered.filter(
        (r) => r.kategori.toLowerCase() === filterKategori.toLowerCase()
      );
    }

    setRekapFiltered(filtered);
  }, [filterNama, filterKategori, rekap]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Rekap Presensi
      </h2>

      <div className="bg-white p-6 rounded-2xl shadow-lg border mb-6">
        <div className="flex flex-wrap items-end justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border px-3 py-1 rounded-lg"
            />
            <button
              onClick={() => fetchRekap(filterDate)}
              className="bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600"
            >
              {loadingRekap ? "Memuat..." : "Tampilkan"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama..."
            value={filterNama}
            onChange={(e) => setFilterNama(e.target.value)}
            className="border px-3 py-2 rounded-lg w-60"
          />

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option>Semua</option>
            <option>Siswa</option>
            <option>Guru</option>
            <option>Karyawan</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-3 border-b">No</th>
                <th className="px-4 py-3 border-b">Nomor Unik</th>
                <th className="px-4 py-3 border-b">Nama</th>
                <th className="px-4 py-3 border-b">Kategori</th>
                <th className="px-4 py-3 border-b">Jam Masuk</th>
                <th className="px-4 py-3 border-b">Jam Pulang</th>
              </tr>
            </thead>

            <tbody>
              {rekapFiltered.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rekapFiltered.map((r, idx) => (
                  <tr key={r.key} className="border-b">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">{r.nomor_unik}</td>
                    <td className="px-4 py-3">{r.nama}</td>
                    <td className="px-4 py-3 capitalize">{r.kategori}</td>
                    <td className="px-4 py-3">{r.jamMasukFormatted}</td>
                    <td className="px-4 py-3">{r.jamPulangFormatted}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RekapPresensi;

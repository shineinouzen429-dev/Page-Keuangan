import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const Presensi = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);
  const [status, setStatus] = useState("Masuk");

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const icon =
      type === "error" ? "error" : type === "success" ? "success" : "info";
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  const getDetailInfo = (item) => {
    if (!item) return { label: "Detail", value: "-" };
    const k = item.kategori?.toLowerCase();
    if (k === "guru")
      return { label: "Mapel", value: item.jabatan || item.mapel || "-" };
    if (k === "siswa")
      return {
        label: "Kelas",
        value: `${item.kelas || "-"} - ${item.jurusan || "-"}`,
      };
    if (k === "karyawan") return { label: "Bagian", value: item.bagian || "-" };
    return { label: "Detail", value: "-" };
  };

  useEffect(() => {
    if (!nomorUnik) return setDataOrang(null);

    let cancelled = false;
    const timer = setTimeout(() => {
      lookupNomorUnik(nomorUnik).catch(() => {
        if (!cancelled) showMessage("Gagal lookup data", "error");
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nomorUnik]);

  const lookupNomorUnik = async (nomor) => {
    setLoadingLookup(true);
    try {
      const res = await axios.get(`${API_BASE}/masterdata`, {
        params: { nomor_unik: nomor },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.masterdata || [];

      if (!data || data.length === 0) {
        setDataOrang(null);
        showMessage("Nomor unik tidak ditemukan", "error");
        return null;
      }

      const orang = data[0];
      setDataOrang(orang);
      return orang;
    } catch (err) {
      setDataOrang(null);
      throw err;
    } finally {
      setLoadingLookup(false);
    }
  };

  useEffect(() => {
    fetchRekap(filterDate);
  }, []);

  const fetchRekap = async (date) => {
    setLoadingRekap(true);
    try {
      const res = await axios.get(`${API_BASE}/presensi`, { params: { date } });
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

      const newList = Object.values(merged).map((r) => ({
        ...r,
        jamMasukFormatted: fmtTime(r.jam_masuk),
        jamPulangFormatted: fmtTime(r.jam_pulang),
        key: r.id,
      }));

      setRekap(newList);
      setRekapFiltered(newList);
    } catch (err) {
      console.error(err);
      showMessage("Gagal load rekap presensi", "error");
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

  const handleDeletePresensi = async (id) => {
    if (!id) return;
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Yakin hapus data presensi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/presensi/${id}`);
      showMessage("Data presensi dihapus", "success");
      fetchRekap(filterDate);
    } catch (err) {
      console.error(err);
      showMessage("Gagal menghapus presensi", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid", "error");

    setSaving(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 10);
      const jam = now.toTimeString().slice(0, 5);

      let payload = {
        nomor_unik: nomorUnik,
        nama: dataOrang.nama,
        kategori: dataOrang.kategori || "",
        kelas: dataOrang.kelas || "",
        jurusan: dataOrang.jurusan || "",
        jabatan: dataOrang.jabatan || "",
        bagian: dataOrang.bagian || "",
        tanggal,
      };

      if (status === "Masuk") payload.jam_masuk = now.toISOString();
      else payload.jam_pulang = now.toISOString();

      const todayRes = await axios.get(`${API_BASE}/presensi`, {
        params: { date: tanggal, nomor_unik: nomorUnik },
      });
      const todayList = Array.isArray(todayRes.data)
        ? todayRes.data
        : todayRes.data?.presensi || [];
      const today = todayList[0];

      if (status === "Masuk") {
        if (today && today.jam_masuk) {
          showMessage("Sudah presensi masuk hari ini!", "error");
          setSaving(false);
          return;
        }
      } else {
        if (!today || !today.jam_masuk) {
          showMessage("Belum presensi masuk!", "error");
          setSaving(false);
          return;
        }
        if (today.jam_pulang) {
          showMessage("Sudah presensi pulang hari ini!", "error");
          setSaving(false);
          return;
        }
      }

      await axios.post(`${API_BASE}/presensi`, payload);
      showMessage(
        `Presensi ${status} tersimpan: ${dataOrang.nama} - ${jam}`,
        "success"
      );
      await fetchRekap(tanggal);

      setNomorUnik("");
      setDataOrang(null);
    } catch (err) {
      console.error(err);
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
     <div className="flex items-center gap-4 mb-8 justify-center">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
        <i className="ri-id-card-fill text-white text-3xl"></i>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 leading-tight">
          Presensi Sekolah
        </h2>
        <p className="text-gray-800 text-sm -mt-1">
          Halaman untuk mengelola data presensi harian
        </p>
      </div>
     </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg border mb-10"
      >
        <h3 className="text-xl font-semibold mb-5 text-gray-700">
          Input Presensi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Unik</label>
            <input
              type="text"
              value={nomorUnik}
              onChange={(e) => setNomorUnik(e.target.value.trim())}
              placeholder="Massukan Nomer Unik"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              disabled
              value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              disabled
              value={dataOrang?.kategori || "-"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {getDetailInfo(dataOrang).label}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              disabled
              value={getDetailInfo(dataOrang).value}
            />
          </div>
        </div>
        <div className="mt-5 mb-4">
          <label className="block text-sm font-medium mb-2">
            Status Presensi
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={status === "Masuk"}
                onChange={() => setStatus("Masuk")}
              />
              Masuk
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={status === "Pulang"}
                onChange={() => setStatus("Pulang")}
              />
              Pulang
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full md:w-auto px-5 py-2 rounded-xl text-white shadow-md transition
            ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {saving ? "Menyimpan..." : "Simpan Presensi"}
        </button>
      </form>
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <div className="flex flex-wrap items-end justify-between mb-4 gap-3">
          <h3 className="text-xl font-semibold text-gray-700">
            Rekap Presensi
          </h3>

          <div className="flex flex-wrap gap-2 items-center">
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
                <th className="px-4 py-3 border-b">Detail</th>
                <th className="px-4 py-3 border-b">Jam Masuk</th>
                <th className="px-4 py-3 border-b">Jam Pulang</th>
                <th className="px-4 py-3 text-center border-b">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rekapFiltered.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rekapFiltered.map((r, idx) => {
                  const detail = getDetailInfo(r);
                  return (
                    <tr key={r.key} className="border-b">
                      <td className="px-4 py-3 text-center">{idx + 1}</td>
                      <td className="px-4 py-3">{r.nomor_unik}</td>
                      <td className="px-4 py-3">{r.nama}</td>
                      <td className="px-4 py-3 capitalize">{r.kategori}</td>
                      <td className="px-4 py-3">
                        <b>{detail.label}:</b> {detail.value}
                      </td>
                      <td className="px-4 py-3">{r.jamMasukFormatted}</td>
                      <td className="px-4 py-3">{r.jamPulangFormatted}</td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeletePresensi(r.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Presensi;

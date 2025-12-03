// Presensi.jsx
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
  const [loadingRekap, setLoadingRekap] = useState(false);

  const showMessage = (text, type = "info") => {
    const icon = type === "error" ? "error" : type === "success" ? "success" : "info";
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  const getDetailInfo = (item) => {
    if (!item) return { label: "Detail", value: "-" };
    const k = item.kategori?.toLowerCase();
    if (k === "guru") return { label: "Mapel", value: item.jabatan || item.mapel || "-" };
    if (k === "siswa") return { label: "Kelas", value: `${item.kelas || "-"} - ${item.jurusan || "-"}` };
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
      const res = await axios.get(`${API_BASE}/masterdata`, { params: { nomor_unik: nomor } });
      const data = Array.isArray(res.data) ? res.data : res.data?.masterdata || [];

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
      const list = Array.isArray(res.data) ? res.data : res.data?.presensi || [];

      // Split menjadi baris Masuk & Pulang
      const newList = [];
      list.forEach((r) => {
        if (r.jam_masuk) newList.push({ ...r, waktu: `Masuk: ${fmtTime(r.jam_masuk)}`, key: r.id + "_masuk" });
        if (r.jam_pulang) newList.push({ ...r, waktu: `Pulang: ${fmtTime(r.jam_pulang)}`, key: r.id + "_pulang" });
      });

      setRekap(newList);
    } catch (err) {
      console.error(err);
      showMessage("Gagal load rekap presensi", "error");
    } finally {
      setLoadingRekap(false);
    }
  };

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

      const todayRes = await axios.get(`${API_BASE}/presensi`, { params: { date: tanggal, nomor_unik: nomorUnik } });
      const todayList = Array.isArray(todayRes.data) ? todayRes.data : todayRes.data?.presensi || [];
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
      showMessage(`Presensi ${status} tersimpan: ${dataOrang.nama} - ${jam}`, "success");
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Presensi Manual</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 max-w-xl">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nomor Unik</label>
          <input
            type="text"
            value={nomorUnik}
            onChange={(e) => setNomorUnik(e.target.value.trim())}
            placeholder="contoh: S-00123"
            className="w-full border rounded px-3 py-2"
            disabled={saving}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nama</label>
          <select className="w-full border rounded px-3 py-2 bg-slate-50" disabled>
            <option>{loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select className="w-full border rounded px-3 py-2 bg-slate-50" disabled>
            <option>{dataOrang?.kategori || "-"}</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{getDetailInfo(dataOrang).label}</label>
          <select className="w-full border rounded px-3 py-2 bg-slate-50" disabled>
            <option>{getDetailInfo(dataOrang).value}</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={status === "Masuk"} onChange={() => setStatus("Masuk")} /> Masuk
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={status === "Pulang"} onChange={() => setStatus("Pulang")} /> Pulang
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saving ? "Menyimpan..." : "Simpan Presensi"}
          </button>
        </div>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rekap Presensi</h3>
          <div className="flex gap-2 items-center">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border rounded px-2 py-1" />
            <button onClick={() => fetchRekap(filterDate)}>
              {loadingRekap ? "Memuat..." : ""}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
          <table className="table-auto w-full text-sm">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nomor Unik</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">Waktu</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rekap.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500 italic">Belum ada data</td></tr>
              ) : (
                rekap.map((r, idx) => {
                  const detail = getDetailInfo(r);
                  return (
                    <tr key={r.key} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-t`}>
                      <td className="text-center py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{r.nomor_unik || "-"}</td>
                      <td className="px-4 py-3">{r.nama || "-"}</td>
                      <td className="px-4 py-3">{r.kategori || "-"}</td>
                      <td className="px-4 py-3"><span className="font-semibold">{detail.label}:</span> {detail.value}</td>
                      <td className="px-4 py-3">{r.waktu}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeletePresensi(r.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
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

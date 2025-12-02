import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000"; 

const Presensi = () => {

  const [nomorUnik, setNomorUnik] = useState("");
  const [siswa, setSiswa] = useState(null); 
  const [status, setStatus] = useState("Masuk"); 
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);


  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [rekap, setRekap] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);


  const [message, setMessage] = useState(null);
  const msgTimer = useRef(null);


  const showMessage = (text, type = "info", ms = 4000) => {
    setMessage({ text, type });
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(null), ms);
  };

  useEffect(() => {
    if (!nomorUnik) {
      setSiswa(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      lookupSiswa(nomorUnik).catch((err) => {
        if (!cancelled) {
          console.error(err);
          showMessage("Gagal lookup siswa", "error");
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nomorUnik]);

  useEffect(() => {
    fetchRekap(filterDate);

  }, []);

  const lookupSiswa = async (nomor) => {
    setLoadingLookup(true);
    try {
      const res = await axios.get("/api/siswa", { params: { nomor_unik: nomor } });
      const data = res.data;
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setSiswa(null);
        showMessage("Nomor unik tidak ditemukan", "error", 2500);
        return null;
      }

      const siswaData = Array.isArray(data) ? data[0] : data;
      setSiswa(siswaData);
      return siswaData;
    } catch (err) {
      setSiswa(null);
      throw err;
    } finally {
      setLoadingLookup(false);
    }
  };

  const fetchRekap = async (date) => {
    setLoadingRekap(true);
    try {
      const res = await axios.get("/api/presensi", { params: { date } });
      setRekap(res.data || []);
    } catch (err) {
      console.error(err);
      showMessage("Gagal load rekap presensi", "error");
    } finally {
      setLoadingRekap(false);
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!nomorUnik) return showMessage("Masukkan nomor unik siswa", "error");
    if (!siswa) return showMessage("Nomor unik belum valid", "error");

    setSaving(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 10); 
      const jam = now.toTimeString().slice(0, 8);
      let payload = { nomor_unik: nomorUnik, tanggal };

      if (status === "Masuk") {
        payload.jam_masuk = now.toISOString();
      } else {
        payload.jam_pulang = now.toISOString();
      }

      const todayRes = await axios.get("/api/presensi", { params: { date: tanggal, nomor_unik: nomorUnik } });
      const todayRecords = todayRes.data || [];
      const today = todayRecords[0];

      if (status === "Masuk") {
        if (today && today.jam_masuk) {
          showMessage("Siswa sudah melakukan presensi masuk hari ini", "error");
          setSaving(false);
          return;
        }

        await axios.post("/api/presensi", payload);
        showMessage(`Presensi MASUK tersimpan: ${siswa.nama} - ${jam}`, "success");
      } else {

        if (!today || !today.jam_masuk) {
          showMessage("Tidak ditemukan presensi masuk hari ini. Masuk harus dilakukan terlebih dahulu.", "error");
          setSaving(false);
          return;
        }
        if (today.jam_pulang) {
          showMessage("Siswa sudah melakukan presensi pulang hari ini", "error");
          setSaving(false);
          return;
        }

        await axios.post("/api/presensi", payload);
        showMessage(`Presensi PULANG tersimpan: ${siswa.nama} - ${jam}`, "success");
      }

      await fetchRekap(tanggal);
 
      setNomorUnik("");
      setSiswa(null);
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
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "error" ? "bg-red-100 text-red-800" : message.type === "success" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}
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
          <div className="text-xs mt-1 text-slate-500">Masukkan nomor unik siswa, lalu sistem akan menampilkan nama jika valid.</div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nama Siswa</label>
          <input type="text" value={loadingLookup ? "Mencari..." : siswa ? siswa.nama : ""} readOnly className="w-full border rounded px-3 py-2 bg-slate-50" />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Status Presensi</label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center">
              <input type="radio" checked={status === "Masuk"} onChange={() => setStatus("Masuk")} className="mr-2" />
              Masuk
            </label>
            <label className="flex items-center">
              <input type="radio" checked={status === "Pulang"} onChange={() => setStatus("Pulang")} className="mr-2" />
              Pulang
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saving ? "Menyimpan..." : "Simpan Presensi"}
          </button>

          <button
            type="button"
            onClick={() => {
              setNomorUnik("");
              setSiswa(null);
            }}
            className="px-4 py-2 rounded border"
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rekap Presensi</h3>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={() => fetchRekap(filterDate)}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={loadingRekap}
            >
              {loadingRekap ? "Memuat..." : "Tampilkan"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 py-2 border text-left">No</th>
                <th className="px-3 py-2 border text-left">Nomor Unik</th>
                <th className="px-3 py-2 border text-left">Nama</th>
                <th className="px-3 py-2 border text-left">Jam Masuk</th>
                <th className="px-3 py-2 border text-left">Jam Pulang</th>
                <th className="px-3 py-2 border text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rekap.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-slate-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                rekap.map((r, idx) => (
                  <tr key={`${r.nomor_unik}-${r.tanggal}`} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 border align-top">{idx + 1}</td>
                    <td className="px-3 py-2 border align-top">{r.nomor_unik}</td>
                    <td className="px-3 py-2 border align-top">{r.nama || "-"}</td>
                    <td className="px-3 py-2 border align-top">{fmtTime(r.jam_masuk)}</td>
                    <td className="px-3 py-2 border align-top">{fmtTime(r.jam_pulang)}</td>
                    <td className="px-3 py-2 border align-top">
                      {r.jam_masuk ? (r.jam_pulang ? "Hadir" : "Belum Pulang") : "Tidak Hadir"}
                    </td>
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

export default Presensi;

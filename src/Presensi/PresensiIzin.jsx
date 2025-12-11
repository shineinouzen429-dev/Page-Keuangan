import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const PresensiIzin = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);
  const [keterangan, setKeterangan] = useState("");

  // Tambahan radio masuk/pulang
  const [jenisPresensi, setJenisPresensi] = useState("masuk");

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  const showMessage = (text, type = "info") => {
    const icon =
      type === "error" ? "error" : type === "success" ? "success" : "info";
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  useEffect(() => {
    if (!nomorUnik) return setDataOrang(null);

    const timer = setTimeout(() => {
      lookupNomorUnik(nomorUnik);
    }, 400);

    return () => clearTimeout(timer);
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

      if (!data.length) {
        setDataOrang(null);
        showMessage("Nomor unik tidak ditemukan", "error");
        return;
      }

      setDataOrang(data[0]);
    } catch {
      showMessage("Gagal mencari data", "error");
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid!", "error");
    if (!keterangan.trim()) return showMessage("Isi keterangan izin!", "error");

    setSaving(true);

    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 10);
      const jamNow = now.toISOString();

      let payload = {
        nomor_unik: nomorUnik,
        nama: dataOrang.nama,
        kategori: dataOrang.kategori || "",
        kelas: dataOrang.kelas || "",
        jurusan: dataOrang.jurusan || "",
        jabatan: dataOrang.jabatan || "",
        bagian: dataOrang.bagian || "",
        tanggal,
        keterangan_izin: keterangan,
      };

      // Tambahkan jam masuk atau pulang
      if (jenisPresensi === "masuk") {
        payload.jam_masuk = jamNow;
      } else {
        payload.jam_pulang = jamNow;
      }

      await axios.post(`${API_BASE}/presensi`, payload);

      showMessage("Izin berhasil disimpan!", "success");

      // Reset
      setNomorUnik("");
      setDataOrang(null);
      setKeterangan("");
      setJenisPresensi("masuk");
    } catch {
      showMessage("Gagal menyimpan izin", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
  <div
    className="min-h-screen w-full flex items-center justify-center p-6 bg-cover bg-center bg-fixed"
    style={{
      backgroundImage:
        "url('https://i.pinimg.com/736x/3f/79/05/3f79054d7cc22ce0693c06893fcdfc3c.jpg')",
    }}
  >
    <a
      href="/MasukPresensi"
      className="fixed top-4 left-4 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-3 rounded-xl shadow-lg text-xl flex items-center justify-center border border-yellow-600"
    >
      <i className="ri-arrow-left-line text-2xl text-black"></i>
    </a>

    <div className="w-full max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-3xl shadow-[0_0_25px_rgba(255,255,0,0.7)] border-2 border-yellow-400 bg-cover bg-center bg-opacity-40 backdrop-blur-xl"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/74/84/aa/7484aa376c9eb3dab93b1828639521b2.jpg')",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <img
              src={
                dataOrang?.foto ||
                "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
              }
              alt={dataOrang?.nama}
              className="w-85 h-85 rounded-2xl object-cover shadow-[0_0_20px_rgba(255,255,0,0.7)] border-2 border-yellow-400"
            />
          </div>
          <div className="space-y-5 text-yellow-300 text-lg font-semibold">

            <div>
              <label className="block font-bold mb-1">Nomor Unik</label>
              <input
                type="text"
                value={nomorUnik}
                onChange={(e) => setNomorUnik(e.target.value.trim())}
                placeholder="Masukkan Nomor Unik"
                className="w-full border border-yellow-400 rounded-xl px-4 py-3 bg-black/60 text-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Nama</label>
              <input
                disabled
                value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
                className="w-full border border-yellow-400 rounded-xl px-4 py-3 bg-black/60 text-yellow-300"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Keterangan Izin</label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Sakit, ada acara keluarga, dll."
                className="w-full border border-yellow-400 rounded-xl px-4 py-3 bg-black/60 text-yellow-300 h-24 resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block font-bold mb-1">Jenis Presensi</label>
              <div className="flex items-center gap-6 text-yellow-300 text-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="jenis"
                    value="masuk"
                    checked={jenisPresensi === "masuk"}
                    onChange={() => setJenisPresensi("masuk")}
                  />
                  Jam Masuk
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="jenis"
                    value="pulang"
                    checked={jenisPresensi === "pulang"}
                    onChange={() => setJenisPresensi("pulang")}
                  />
                  Jam Pulang
                </label>
              </div>
            </div>

          </div>
        </div>
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={saving}
            className={`w-full md:w-64 px-5 py-3 rounded-xl text-black text-xl font-bold shadow-xl border border-yellow-400
              ${
                saving
                  ? "bg-gray-500"
                  : "bg-yellow-400 hover:bg-yellow-500 active:scale-95"
              }
            `}
          >
            {saving ? "Menyimpan..." : "Kirim Izin"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default PresensiIzin;

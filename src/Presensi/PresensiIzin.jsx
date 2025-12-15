import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const PresensiIzin = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [jenisPresensi, setJenisPresensi] = useState("masuk");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  const showMessage = (text, type = "info") => {
    Swal.fire({
      text,
      icon: type,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    if (!nomorUnik) return setDataOrang(null);
    const timer = setTimeout(() => lookupNomorUnik(nomorUnik), 400);
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
    if (!keterangan.trim())
      return showMessage("Isi keterangan izin!", "error");

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
        ...(jenisPresensi === "masuk"
          ? { jam_masuk: jamNow }
          : { jam_pulang: jamNow }),
      };

      await axios.post(`${API_BASE}/presensi`, payload);

      showMessage("Izin berhasil disimpan!", "success");

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
    <div className="min-h-screen flex items-center justify-center p-6
      bg-gradient-to-br from-black via-green-950 to-black">

      <a
        href="/MasukPresensi"
        className="fixed top-4 left-4 bg-green-400 hover:bg-green-500
        text-black px-4 py-3 rounded-xl shadow-lg border border-green-600"
      >
        <i className="ri-arrow-left-line text-2xl"></i>
      </a>

      <div className="w-full max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="
            p-8 rounded-3xl
            bg-black/60 backdrop-blur-xl
            border border-green-400
            shadow-[0_0_30px_rgba(255,215,0,0.45)]
          "
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            <div className="flex justify-center">
              <img
                src={
                  dataOrang?.foto ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
                }
                alt="foto"
                className="w-72 h-72 object-cover rounded-2xl
                border border-green-400
                shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              />
            </div>

            <div className="space-y-5 text-green-300 font-semibold">

              <div>
                <label>Nomor Unik</label>
                <input
                  value={nomorUnik}
                  onChange={(e) => setNomorUnik(e.target.value.trim())}
                  disabled={saving}
                  placeholder="Masukkan nomor unik"
                  className="w-full mt-1 px-4 py-3 rounded-xl
                  bg-black/70 border border-green-400
                  focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label>Nama</label>
                <input
                  disabled
                  value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
                  className="w-full mt-1 px-4 py-3 rounded-xl
                  bg-black/70 border border-green-400"
                />
              </div>

              <div>
                <label>Keterangan Izin</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full mt-1 px-4 py-3 h-24 resize-none rounded-xl
                  bg-black/70 border border-green-400"
                />
              </div>

              <div>
                <label>Jenis Presensi</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex gap-2 items-center">
                    <input
                      type="radio"
                      checked={jenisPresensi === "masuk"}
                      onChange={() => setJenisPresensi("masuk")}
                    />
                    Jam Masuk
                  </label>

                  <label className="flex gap-2 items-center">
                    <input
                      type="radio"
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
              className={`w-full md:w-64 py-3 rounded-xl text-black font-bold
              border border-green-400 shadow-xl transition
              ${
                saving
                  ? "bg-gray-500"
                  : "bg-green-400 hover:bg-green-500 active:scale-95"
              }`}
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

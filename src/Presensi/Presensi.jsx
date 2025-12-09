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

  const showMessage = (text, type = "info") => {
    const icon =
      type === "error" ? "error" : type === "success" ? "success" : "info";
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid", "error");

    setSaving(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 10);
      const jam = now.toISOString();

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

      if (status === "Masuk") payload.jam_masuk = jam;
      else payload.jam_pulang = jam;

      const todayRes = await axios.get(`${API_BASE}/presensi`, {
        params: { tanggal, nomor_unik: nomorUnik },
      });

      const todayList = Array.isArray(todayRes.data)
        ? todayRes.data
        : todayRes.data?.presensi || [];

      const today = todayList[0];

      if (status === "Masuk") {
        if (today && today.jam_masuk) {
          setSaving(false);

          Swal.fire({
            title: "Sudah Presensi Masuk!",
            text: "Anda sudah melakukan presensi masuk hari ini.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Lihat Data",
            cancelButtonText: "Tutup",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/RekapPresensi";
            }
          });

          return;
        }
      }

      if (status === "Pulang") {
        if (!today || !today.jam_masuk) {
          showMessage("Belum presensi masuk!", "error");
          setSaving(false);
          return;
        }

        if (today.jam_pulang) {
          setSaving(false);

          Swal.fire({
            title: "Sudah Presensi Pulang!",
            text: "Anda sudah melakukan presensi pulang hari ini.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Lihat Data",
            cancelButtonText: "Tutup",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/RekapPresensi";
            }
          });

          return;
        }
      }

      await axios.post(`${API_BASE}/presensi`, payload);

      showMessage(
        `Presensi ${status} tersimpan untuk ${dataOrang.nama}`,
        "success"
      );

      setNomorUnik("");
      setDataOrang(null);
    } catch {
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <a
        href="/MasukPresensi"
        className="fixed top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl shadow-lg text-xl flex items-center justify-center"
      >
        <i className="ri-login-box-line"></i>
      </a>

      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-10 justify-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <i className="ri-id-card-fill text-white text-4xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm">
              Presensi Sekolah
            </h2>
            <p className="text-gray-600 text-sm">
              Input presensi harian siswa, guru, dan karyawan
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white flex flex-col gap-8"
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            Form Presensi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="flex justify-center">
              <img
                src={
                  dataOrang?.foto ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
                }
                alt={dataOrang?.nama}
                className="w-56 h-56 rounded-full object-cover shadow-xl border-4 border-blue-500/60"
              />
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nomor Unik
                </label>
                <input
                  type="text"
                  value={nomorUnik}
                  onChange={(e) => setNomorUnik(e.target.value.trim())}
                  placeholder="Masukkan Nomor Unik"
                  className="w-full border rounded-lg px-3 py-2 bg-white shadow focus:ring-2 focus:ring-blue-400 outline-none"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nama
                </label>
                <input
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 shadow-sm"
                  value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Status Presensi
                </label>

                <div className="flex gap-6 mt-1">
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
            </div>                         
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={saving}
              className={`w-full md:w-60 px-6 py-3 rounded-xl text-white text-lg font-semibold shadow-lg transition
              ${
                saving
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }
            `}
            >
              {saving ? "Menyimpan..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Presensi;

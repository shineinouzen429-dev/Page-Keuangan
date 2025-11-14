import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Dashboard = () => {
  const [masterData, setMasterData] = useState([]);
  const [tagihan, setTagihan] = useState([]);
  const [expandedTables, setExpandedTables] = useState({
    guru: false,
    siswa: false,
    karyawan: false,
    tagihan: false,
  });

  const tableRefs = {
    guru: useRef(null),
    siswa: useRef(null),
    karyawan: useRef(null),
    tagihan: useRef(null),
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resMaster, resTagihan] = await Promise.all([
        axios.get("http://localhost:5000/masterdata"),
        axios.get("http://localhost:5000/tagihan"),
      ]);

      setMasterData(resMaster.data || []);
      setTagihan(resTagihan.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  const formatRupiah = (angka) =>
    Number(angka).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  const totalGuru = masterData.filter((d) => d.kategori === "guru").length;
  const totalSiswa = masterData.filter((d) => d.kategori === "siswa").length;
  const totalKaryawan = masterData.filter(
    (d) => d.kategori === "karyawan"
  ).length;
  const totalDatabase = totalGuru + totalSiswa + totalKaryawan;

  const totalLunas = tagihan.filter((t) => t.status === "Lunas").length;
  const totalBelumLunas = tagihan.filter(
    (t) => t.status === "Belum lunas"
  ).length;
  const totalDataTagihan = tagihan.length;
  const totalNominalLunas = tagihan
    .filter((t) => t.status === "Lunas")
    .reduce((sum, t) => sum + (parseInt(t.jumlah) || 0), 0);

  const Table = ({ id, title, columns, data, renderRow }) => {
    const isExpanded = expandedTables[id];
    const displayData = isExpanded ? data : data.slice(0, 3);

    const handleToggleExpand = () => {
      const currentScroll = window.scrollY;
      const tableElement = tableRefs[id].current;

      requestAnimationFrame(() => {
        setExpandedTables((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));

        requestAnimationFrame(() => {
          window.scrollTo({
            top: currentScroll,
            behavior: "instant",
          });
          tableElement?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    };

    return (
      <div ref={tableRefs[id]} className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold mb-3 text-gray-700 border-l-4 border-blue-600 pl-2">
          {title}
        </h2>
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border border-gray-300">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="py-2 px-3 text-left border-b border-gray-200"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map(renderRow)
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-3 text-gray-500 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 3 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleToggleExpand}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold shadow-md transition"
            >
              {isExpanded ? "Tampilkan Lebih Sedikit" : "Lihat Selengkapnya"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center uppercase">
        <i className="ri-dashboard-fill"></i> Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-user-star-fill text-blue-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Total Guru</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">{totalGuru}</h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-green-600 to-green-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-team-fill text-green-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Total Siswa</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalSiswa}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-yellow-600 to-amber-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-user-2-fill text-yellow-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Total Karyawan</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalKaryawan}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-purple-600 to-violet-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-database-2-fill text-purple-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Total Database</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalDatabase}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-green-700 to-emerald-600 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-check-double-line text-green-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Tagihan Lunas</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalLunas}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-red-600 to-rose-600 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-error-warning-fill text-red-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Belum Lunas</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalBelumLunas}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-indigo-600 to-cyan-600 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-file-list-3-line text-cyan-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">
            Total Data Tagihan
          </p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {totalDataTagihan}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-blue-800 to-sky-600 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-money-dollar-circle-line text-blue-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">
            Total Nominal Lunas
          </p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {formatRupiah(totalNominalLunas)}
          </h2>
        </div>
      </div>

      <Table
        id="guru"
        title="Data Guru"
        columns={["No", "Nama", "Mapel / Jabatan"]}
        data={masterData.filter((d) => d.kategori === "guru")}
        renderRow={(guru, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-100">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{guru.nama}</td>
            <td className="py-2 px-3">{guru.jabatan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="siswa"
        title="Data Siswa"
        columns={["No", "Nama", "Kelas", "Jurusan"]}
        data={masterData.filter((d) => d.kategori === "siswa")}
        renderRow={(siswa, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-100">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{siswa.nama}</td>
            <td className="py-2 px-3">{siswa.kelas || "-"}</td>
            <td className="py-2 px-3">{siswa.jurusan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="karyawan"
        title="Data Karyawan"
        columns={["No", "Nama", "Bagian"]}
        data={masterData.filter((d) => d.kategori === "karyawan")}
        renderRow={(kar, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-100">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{kar.nama}</td>
            <td className="py-2 px-3">{kar.bagian || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="tagihan"
        title="Data Pembayaran / Tagihan"
        columns={["No", "Nama", "Jenis Tagihan", "Nominal", "Status"]}
        data={tagihan}
        renderRow={(t, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-100">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{t.name}</td>
            <td className="py-2 px-3">{t.jenis_tagihan}</td>
            <td className="py-2 px-3 text-right">{formatRupiah(t.jumlah)}</td>
            <td
              className={`text-center font-semibold ${
                t.status === "Lunas" ? "text-green-600" : "text-red-600"
              }`}
            >
              {t.status}
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default Dashboard;

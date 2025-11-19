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
    const displayData = isExpanded ? data : data.slice(0, 5);

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
        <h2 className="text-xl font-bold mb-3 text-red-600 border-l-4 border-red-800 pl-2 drop-shadow">
          {title}
        </h2>

        <div className="overflow-x-auto rounded-xl shadow-lg border border-red-700 bg-black/70 backdrop-blur-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-red-800 via-red-600 to-orange-600 text-white">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="py-3 px-4 text-left font-semibold border-b border-red-700"
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
                    className="text-center py-4 text-gray-400 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 5 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleToggleExpand}
              className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-md font-semibold shadow-lg transition"
            >
              {isExpanded ? "Tampilkan Lebih Sedikit" : "Lihat Selengkapnya"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-black via-red-900 to-black bg-fixed">
      <h1 className="text-3xl font-bold text-red-500 mb-8 text-center uppercase tracking-wide drop-shadow-lg">
        <i className="ri-fire-fill text-orange-500 mr-2"></i> Dashboard Neraka
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Guru" value={totalGuru} icon="ri-user-star-fill" />
        <Card title="Total Siswa" value={totalSiswa} icon="ri-team-fill" />
        <Card title="Total Karyawan" value={totalKaryawan} icon="ri-user-2-fill" />
        <Card title="Total Database" value={totalDatabase} icon="ri-database-2-fill" />

        <Card title="Tagihan Lunas" value={totalLunas} icon="ri-check-double-line" />
        <Card title="Belum Lunas" value={totalBelumLunas} icon="ri-error-warning-fill" />
        <Card title="Total Data Tagihan" value={totalDataTagihan} icon="ri-file-list-3-line" />
        <Card
          title="Total Nominal Lunas"
          value={formatRupiah(totalNominalLunas)}
          icon="ri-money-dollar-circle-line"
        />
      </div>

      <Table
        id="guru"
        title="Data Guru"
        columns={["No", "Nama", "Mapel / Jabatan"]}
        data={masterData.filter((d) => d.kategori === "guru")}
        renderRow={(guru, i) => (
          <tr key={i} className="odd:bg-black even:bg-red-900/40 transition text-red-100">
            <td className="py-3 px-4 text-center">{i + 1}</td>
            <td className="py-3 px-4">{guru.nama}</td>
            <td className="py-3 px-4">{guru.jabatan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="siswa"
        title="Data Siswa"
        columns={["No", "Nama", "Kelas", "Jurusan"]}
        data={masterData.filter((d) => d.kategori === "siswa")}
        renderRow={(siswa, i) => (
          <tr key={i} className="odd:bg-black even:bg-red-900/40 transition text-red-100">
            <td className="py-3 px-4 text-center">{i + 1}</td>
            <td className="py-3 px-4">{siswa.nama}</td>
            <td className="py-3 px-4">{siswa.kelas || "-"}</td>
            <td className="py-3 px-4">{siswa.jurusan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="karyawan"
        title="Data Karyawan"
        columns={["No", "Nama", "Bagian"]}
        data={masterData.filter((d) => d.kategori === "karyawan")}
        renderRow={(kar, i) => (
          <tr key={i} className="odd:bg-black even:bg-red-900/40 transition text-red-100">
            <td className="py-3 px-4 text-center">{i + 1}</td>
            <td className="py-3 px-4">{kar.nama}</td>
            <td className="py-3 px-4">{kar.bagian || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="tagihan"
        title="Data Pembayaran / Tagihan"
        columns={["No", "Nama", "Jenis Tagihan", "Nominal", "Status"]}
        data={tagihan}
        renderRow={(t, i) => (
          <tr key={i} className="odd:bg-black even:bg-red-900/40 transition text-red-100">
            <td className="py-3 px-4 text-center">{i + 1}</td>
            <td className="py-3 px-4">{t.name}</td>
            <td className="py-3 px-4">{t.jenis_tagihan}</td>
            <td className="py-3 px-4 text-right">{formatRupiah(t.jumlah)}</td>
            <td
              className={`text-center font-semibold ${
                t.status === "Lunas" ? "text-green-400" : "text-red-500"
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

const Card = ({ icon, title, value }) => (
  <div
    className="bg-gradient-to-br from-red-800 via-red-600 to-orange-600 
    text-white rounded-xl shadow-lg p-6 relative overflow-hidden 
    transform hover:scale-[1.05] transition duration-300 border border-red-900"
  >
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

    <i className={`${icon} absolute right-3 bottom-3 text-[75px] opacity-20 text-yellow-300`}></i>

    <p className="text-sm font-semibold relative z-10">{title}</p>
    <h2 className="text-3xl font-bold mt-1 relative z-10">{value}</h2>
  </div>
);

export default Dashboard;

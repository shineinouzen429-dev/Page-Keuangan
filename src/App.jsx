import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './Component/Dashboard';
import Login from './Component/Login';
import Register from './Component/Register';

import Tambahtagihan from './Abaikan/Tambahtagihan';
import Edittagihan from './Abaikan/Edittagihan';
import Tambahjenistagihan from './Abaikan/Tambahjenistagihan';
import Editjenistagihan from './Abaikan/Editjenistagihan';

import KategoriTagihan from './Keuangan/KategoriTagihan';
import Tagihan from './Keuangan/Tagihan';
import RekapTagihan from './Keuangan/RekapTagihan';

import KategoriData from './Database/KategoriData';
import Kelas from './Database/Kelas';
import MasterData from './Database/Masterdata';

import MainLayout from './Component/MainLayout';
import Presensi from './Projectbaru/Presensi';
import RekapPresensi from './Projectbaru/RekapPresensi';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/Login" element={<Login />} />

    
        <Route path="/" element={<MainLayout />}>
          <Route path="Dashboard" element={<Dashboard />} />

          <Route path="Tagihan" element={<Tagihan />} />
          <Route path="RekapTagihan" element={<RekapTagihan />} />
          <Route path="KategoriTagihan" element={<KategoriTagihan />} />
        
          <Route path="KategoriData" element={<KategoriData />} />
          <Route path="Kelas" element={<Kelas />} />
          <Route path="MasterData" element={<MasterData />} />

          <Route path="Presensi" element={<Presensi />} />
          <Route path="RekapPresensi" element={<RekapPresensi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

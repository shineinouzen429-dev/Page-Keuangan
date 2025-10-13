import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './Component/Dashboard';
import Login from './Component/Login';
import Register from './Component/Register';

import Tagihan from './Component/Tagihan';
import Tambahtagihan from './Component/Tambahtagihan';
import Edittagihan from './Component/Edittagihan';

import Jenistagihan from './Component/Jenistagihan';
import Tambahjenistagihan from './Component/Tambahjenistagihan';
import Editjenistagihan from './Component/Editjenistagihan';

import MainLayout from './Component/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/Login" element={<Login />} />

    
        <Route path="/" element={<MainLayout />}>
          <Route path="Dashboard" element={<Dashboard />} />

          <Route path="Tagihan" element={<Tagihan />} />
          <Route path="Tambahtagihan" element={<Tambahtagihan />} />
          <Route path="Edittagihanedit/:id" element={<Edittagihan />} />
   

          <Route path="Jenistagihan" element={<Jenistagihan />} />
          <Route path="TambahJenistagihan" element={<Tambahjenistagihan />} />
          <Route path="EditjenisTagihanedit/:id" element={<Editjenistagihan />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

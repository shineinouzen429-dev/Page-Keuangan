import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './Component/Dashboard';
import Login from './Component/Login';
import Register from './Component/Register';
import Tagihan from './Component/Tagihan';
import Jenistagihan from './Component/Jenistagihan';

import MainLayout from './Component/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/L" element={<Login />} />

    
        <Route path="/" element={<MainLayout />}>
          <Route path="D" element={<Dashboard />} />
          <Route path="T" element={<Tagihan />} />
          <Route path="J" element={<Jenistagihan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

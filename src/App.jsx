import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./Component/Dashboard";
import Login from "./Component/Login";
import Register from "./Component/Register";
import Sidnav from "./Component/Sidnav";
import Jenistagihan from "./Pages/Jenistagihan";
import Tagihan from "./Pages/Tagihan";

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();
  const showSidnav = ["/D", "/T", "/J"].includes(location.pathname); // cuma muncul di halaman ini

  return (
    <div className="flex">
      {showSidnav && <Sidnav />} {/* muncul hanya di halaman tertentu */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/L" element={<Login />} />
          <Route path="/D" element={<Dashboard />} />
          <Route path="/T" element={<Tagihan />} />
          <Route path="/J" element={<Jenistagihan />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

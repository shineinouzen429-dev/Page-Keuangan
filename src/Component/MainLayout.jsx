import React from 'react';
import Sidnav from './Sidnav';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <Sidnav />
      <div className="ml-60 p-6">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;

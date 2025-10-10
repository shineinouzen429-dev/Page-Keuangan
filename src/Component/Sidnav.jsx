import React, { useState } from 'react'

function Sidnav ()  {
  const [open, setOpen] = useState (false);
  return (
    <div className='flex'>
      <button onClick={() => setOpen(!open)} className="m-4 bg-gray-700 text-white px-3 py-2 rounded">
  {open ? "Tutup" : "Buka"}
</button>

      <div className={` fixed top-0 h-full w-60 bg-gray-800 text-white
            ${open ? "translate-x-0" : "-translate-x-full"}
            transition-transform duration-300 ease-in-out md:translate-x-0`}>
              <div className='text-xl font-bold mb-8 text-center bg-gray-700 py-4 shadow-lg'>Binus</div>

              <nav>
                <a href="/D" className='block py-3 px-4 rounded hover:bg-blue-600 text-2xl'>Dasboard</a>
                <a href="/T" className='block py-3 px-4 rounded hover:bg-blue-600 text-2xl'>Tagihan</a>
                <a href="/J" className='block py-3 px-4 rounded hover:bg-blue-600 text-2xl'>Jenis tagihan</a>
              </nav>
              
              <div className=''></div>
      </div>
    </div>
  )
}

export default Sidnav
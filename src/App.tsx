import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Gamepad2, Swords, Boxes, Home as HomeIcon } from 'lucide-react'

const App: React.FC = () => {
  const linkBase = 'px-3 py-2 rounded-xl font-medium transition hover:scale-105'
  const linkActive = 'bg-white text-gray-900'
  const linkInactive = 'text-white/90 hover:bg-white/20'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="sticky top-0 z-50 backdrop-blur bg-slate-900/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <img 
              src="/icono/logo.png" 
              alt="Robot" 
              style={{ width: 64, height: 64, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
            <span>ET32 DE 14 - Gral. José de San Martín</span>
           </div>
          <div className="flex-1" >
            <img 
              src="/icono/qr.png" 
              alt="ET 32 - Juegos" 
              style={{ width: 70, height: 70, objectFit: 'contain' }}
              className="inline-block align-middle "
            />
          </div>
          <div className="flex gap-2">
            <NavLink to="/" end
              className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <div className="flex items-center gap-2"><HomeIcon size={18}/>Inicio</div>
            </NavLink>
            <NavLink to="/programacion"
              className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <div className="flex items-center gap-2">
                <img 
                  src="/icono/robot.png" 
                  alt="Robot" 
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                  className="inline-block align-middle"
                />
                Programación
              </div>
            </NavLink>
            <NavLink to="/pokemon"
              className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <div className="flex items-center gap-2">            
                <img 
                  src="/Pokemones/Pikachu.png" 
                  alt="Pikachu" 
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                  className="inline-block align-middle"
                />
                Pokémon
              </div>
            </NavLink>
            <NavLink to="/hanoi"
              className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <div className="flex items-center gap-2">
                <img 
                  src="/icono/hanoi.webp" 
                  alt="Torres de Hanoi" 
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                  className="inline-block align-middle"
                />
                Hanoi
              </div>
            </NavLink>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  )
}

export default App

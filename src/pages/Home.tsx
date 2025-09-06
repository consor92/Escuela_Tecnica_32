import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Binary, Puzzle, Swords } from 'lucide-react'

const Card = ({title, desc, to, icon}:{title:string, desc:string, to:string, icon:React.ReactNode}) => (
  <Link to={to} className="block bg-white/5 hover:bg-white/10 border m-2 border-white/10 rounded-3xl p-6 transition transform hover:-translate-y-1 shadow-xl">
    <div className="flex items-center gap-3 mb-3 text-white">
      {icon}
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-slate-300">{desc}</p>
  </Link>
)

const Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="text-center mb-10">

        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Colección de juegos educativos
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto mt-3">
          Elegí un juego del menú o desde estas tarjetas. ¡Todo corre directo en tu navegador!
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          title="Programando con Bots"
          desc="Secuencia de comandos para mover un robot y alcanzar la meta."
          to="/programacion"
          icon={
            <img 
              src="/icono/robot.png" 
              alt="Robot" 
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
          }
        />
        <Card 
          title="Busqueda Binaria de Pokémon"
          desc="Práctica búsqueda binaria encontrando al Pokémon."
          to="/pokemon"
          icon={
            <img 
              src="/Pokemones/Pikachu.png" 
              alt="Pikachu" 
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
          }
        />
        <Card 
          title="Torres de Hanoi"
          desc="Mueve los discos sin romper las reglas."
          to="/hanoi"
          icon={
            <img 
              src="/icono/hanoi.webp" 
              alt="Torres de Hanoi" 
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
          }
        />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-12 my-10">
        <Card 
          title="Segui jugando en casa las veces que quieras"
          desc="Escanea el QR y guarda la url en tus favoritos."
          to="/"
          icon={
            <img 
              src="/icono/qr.png" 
              alt="ET 32 - Juegos" 
              style={{ width: 70, height: 70, objectFit: 'contain' }}
              className="inline-block align-middle "
            />
          }
        />
                <Card 
          title="Inscribite en nuestra escuela, vení a aprender y divertirte"
          desc="El mundo de la computación te esta esperando. No te pierdas la oportunidad.¡Inscribite ahora!"
          to="https://www.escuelatecnica32de14.edu.ar/"
          icon={
            <img 
              src="/icono/logo.png" 
              alt="ET 32" 
              style={{ width: 70, height: 70, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
          }
        />
        </div>
    </div>
  )
}

export default Home

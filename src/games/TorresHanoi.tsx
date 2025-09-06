import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Target } from 'lucide-react';

const TorresHanoi = () => {
  const [torres, setTorres] = useState([[], [], []]);
  const [numDiscos, setNumDiscos] = useState(3);
  const [discoSeleccionado, setDiscoSeleccionado] = useState(null);
  const [torreSeleccionada, setTorreSeleccionada] = useState(null);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // Colores para los discos
  const coloresDiscos = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  // Inicializar el juego
  const inicializarJuego = () => {
    const nuevasTorres = [[], [], []];
    for (let i = numDiscos; i >= 1; i--) {
      nuevasTorres[0].push(i);
    }
    setTorres(nuevasTorres);
    setDiscoSeleccionado(null);
    setTorreSeleccionada(null);
    setMovimientos(0);
    setJuegoCompletado(false);
    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
  };

  // Efecto para inicializar el juego
  useEffect(() => {
    inicializarJuego();
  }, [numDiscos]);

  // Efecto para el cronómetro
  useEffect(() => {
    let intervalo;
    if (tiempoInicio && !juegoCompletado) {
      intervalo = setInterval(() => {
        setTiempoTranscurrido(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [tiempoInicio, juegoCompletado]);

  // Verificar si el juego está completado
  useEffect(() => {
    if (torres[2].length === numDiscos && torres[2].length > 0) {
      setJuegoCompletado(true);
    }
  }, [torres, numDiscos]);

  // Manejar clic en torre
  const manejarClicTorre = (indiceTorre) => {
    if (juegoCompletado) return;

    if (torreSeleccionada === null) {
      // Seleccionar torre de origen
      if (torres[indiceTorre].length > 0) {
        setTorreSeleccionada(indiceTorre);
        setDiscoSeleccionado(torres[indiceTorre][torres[indiceTorre].length - 1]);
      }
    } else {
      // Intentar mover disco
      if (indiceTorre === torreSeleccionada) {
        // Deseleccionar
        setTorreSeleccionada(null);
        setDiscoSeleccionado(null);
      } else {
        // Verificar si el movimiento es válido
        const discoAMover = torres[torreSeleccionada][torres[torreSeleccionada].length - 1];
        const torreDestino = torres[indiceTorre];
        
        if (torreDestino.length === 0 || discoAMover < torreDestino[torreDestino.length - 1]) {
          // Movimiento válido
          const nuevasTorres = [...torres];
          const disco = nuevasTorres[torreSeleccionada].pop();
          nuevasTorres[indiceTorre].push(disco);
          
          setTorres(nuevasTorres);
          setMovimientos(mov => mov + 1);
          setTorreSeleccionada(null);
          setDiscoSeleccionado(null);
        } else {
          // Movimiento inválido - deseleccionar
          setTorreSeleccionada(null);
          setDiscoSeleccionado(null);
        }
      }
    }
  };

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // Calcular movimientos mínimos
  const movimientosMinimos = Math.pow(2, numDiscos) - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">

          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Torres de Hanoi
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Mueve todos los discos de la torre izquierda a la derecha. Solo puedes mover un disco a la vez y nunca colocar un disco grande sobre uno pequeño.
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <label className="block text-white text-sm font-medium mb-2">Número de discos:</label>
            <select 
              value={numDiscos} 
              onChange={(e) => setNumDiscos(parseInt(e.target.value))}
              className="bg-white/20 text-white rounded px-3 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {[3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n} className="bg-gray-800">{n}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={inicializarJuego}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <RotateCcw size={20} />
            Reiniciar
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="text-blue-400" size={24} />
              <span className="text-white font-medium">Movimientos</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{movimientos}</div>
            <div className="text-sm text-gray-300">Mínimo: {movimientosMinimos}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="text-green-400" size={24} />
              <span className="text-white font-medium">Tiempo</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{formatearTiempo(tiempoTranscurrido)}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="text-purple-400" size={24} />
              <span className="text-white font-medium">Estado</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {juegoCompletado ? '¡Completado!' : 'En progreso'}
            </div>
          </div>
        </div>

        {/* Mensaje de victoria */}
        {juegoCompletado && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-lg text-center mb-8 shadow-lg">
            <div className="text-2xl font-bold mb-2">¡Felicitaciones! 🎉</div>
            <div className="text-lg">
              Completaste el puzzle en {movimientos} movimientos y {formatearTiempo(tiempoTranscurrido)}
            </div>
            {movimientos === movimientosMinimos && (
              <div className="text-yellow-200 mt-2 font-medium">¡Solución óptima! ⭐</div>
            )}
          </div>
        )}

        {/* Torres */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {torres.map((torre, indiceTorre) => (
            <div key={indiceTorre} className="flex flex-col items-center">
              {/* Etiqueta de torre */}
              <div className="text-white text-lg font-medium mb-4">
                Torre {indiceTorre + 1}
                {indiceTorre === 0 && " (Origen)"}
                {indiceTorre === 2 && " (Destino)"}
              </div>
              
              {/* Torre clickeable */}
              <div 
                onClick={() => manejarClicTorre(indiceTorre)}
                className={`relative cursor-pointer transition-all duration-200 ${
                  torreSeleccionada === indiceTorre 
                    ? 'transform scale-105 ring-4 ring-yellow-400' 
                    : 'hover:transform hover:scale-102'
                }`}
                style={{ height: `${(numDiscos + 1) * 40 + 60}px`, width: '200px' }}
              >
                {/* Base de la torre */}
                <div className="absolute bottom-0 w-full h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg shadow-lg"></div>
                
                {/* Poste */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg shadow-lg" 
                     style={{ height: `${(numDiscos + 1) * 40}px` }}></div>
                
                {/* Discos */}
                {torre.map((disco, indiceEnTorre) => {
                  const ancho = 40 + disco * 20;
                  const esSeleccionado = discoSeleccionado === disco && torreSeleccionada === indiceTorre;
                  
                  return (
                    <div
                      key={`${indiceTorre}-${indiceEnTorre}`}
                      className={`absolute left-1/2 transform -translate-x-1/2 h-8 rounded-lg shadow-lg transition-all duration-300 ${
                        esSeleccionado ? 'animate-pulse ring-4 ring-white transform -translate-y-2' : ''
                      }`}
                      style={{
                        width: `${ancho}px`,
                        bottom: `${20 + indiceEnTorre * 40}px`,
                        backgroundColor: coloresDiscos[disco - 1],
                        background: `linear-gradient(145deg, ${coloresDiscos[disco - 1]}, ${coloresDiscos[disco - 1]}dd)`
                      }}
                    >
                      {/* Número del disco */}
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                        {disco}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Instrucciones */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-white text-xl font-bold mb-4">¿Cómo jugar?</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Haz clic en una torre para seleccionar el disco superior</li>
            <li>• Haz clic en otra torre para mover el disco seleccionado</li>
            <li>• No puedes colocar un disco grande sobre uno pequeño</li>
            <li>• El objetivo es mover todos los discos a la torre derecha</li>
            <li>• Intenta completarlo en el mínimo número de movimientos</li>
          </ul>
        </div>

        {/* Footer del Colegio */}
        <div className="mt-8 text-center">
          <div className="text-gray-400 text-sm">
            Desarrollado para la Escuela Técnica N° 32 DE 14 "Gral. José de San Martín"
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorresHanoi;
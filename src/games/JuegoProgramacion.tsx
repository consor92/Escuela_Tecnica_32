import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, Heart } from 'lucide-react';

const JuegoProgramacion = () => {
  // Estados del juego
  const [nivel, setNivel] = useState(1);
  const [posicionRobot, setPosicionRobot] = useState({ x: 0, y: 0 });
  const [comandos, setComandos] = useState([]);
  const [ejecutando, setEjecutando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [intentos, setIntentos] = useState(0);

  // Configuración de niveles
  const niveles = {
    1: {
      titulo: "¡Encuentra la estrella!",
      descripcion: "Ayuda al robot a llegar a la estrella",
      grilla: 4,
      inicio: { x: 0, y: 0 },
      objetivo: { x: 2, y: 1 },
      obstaculos: [],
      maxComandos: 5
    },
    2: {
      titulo: "Esquiva el obstáculo",
      descripcion: "Rodea el obstáculo para llegar a la estrella",
      grilla: 5,
      inicio: { x: 0, y: 2 },
      objetivo: { x: 4, y: 2 },
      obstaculos: [{ x: 2, y: 2 }],
      maxComandos: 8
    },
    3: {
      titulo: "Laberinto fácil",
      descripcion: "Encuentra el camino en este pequeño laberinto",
      grilla: 6,
      inicio: { x: 0, y: 0 },
      objetivo: { x: 5, y: 5 },
      obstaculos: [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ],
      maxComandos: 12
    }
  };

  const nivelActual = niveles[nivel];

  // Inicializar nivel
  const inicializarNivel = () => {
    setPosicionRobot(nivelActual.inicio);
    setComandos([]);
    setEjecutando(false);
    setCompletado(false);
    setIntentos(0);
  };

  useEffect(() => {
    inicializarNivel();
  }, [nivel]);

  // Agregar comando
  const agregarComando = (comando) => {
    if (comandos.length < nivelActual.maxComandos && !ejecutando) {
      setComandos([...comandos, comando]);
    }
  };

  // Eliminar último comando
  const eliminarComando = () => {
    if (!ejecutando) {
      setComandos(comandos.slice(0, -1));
    }
  };

  // Ejecutar programa
  const ejecutarPrograma = async () => {
    if (comandos.length === 0 || ejecutando) return;

    setEjecutando(true);
    setIntentos(intentos + 1);
    let posicion = { ...nivelActual.inicio };

    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i];
      let nuevaPosicion = { ...posicion };

      switch (comando) {
        case 'arriba':
          nuevaPosicion.y = Math.max(0, posicion.y - 1);
          break;
        case 'abajo':
          nuevaPosicion.y = Math.min(nivelActual.grilla - 1, posicion.y + 1);
          break;
        case 'izquierda':
          nuevaPosicion.x = Math.max(0, posicion.x - 1);
          break;
        case 'derecha':
          nuevaPosicion.x = Math.min(nivelActual.grilla - 1, posicion.x + 1);
          break;
      }

      // Verificar colisión con obstáculos
      const hayObstaculo = nivelActual.obstaculos.some(
        obs => obs.x === nuevaPosicion.x && obs.y === nuevaPosicion.y
      );

      if (!hayObstaculo) {
        posicion = nuevaPosicion;
        setPosicionRobot(posicion);
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Verificar si llegó al objetivo
    if (posicion.x === nivelActual.objetivo.x && posicion.y === nivelActual.objetivo.y) {
      setCompletado(true);
      const puntosGanados = Math.max(10 - intentos, 1) * nivel;
      setPuntos(puntos + puntosGanados);
    }

    setEjecutando(false);
  };

  // Reiniciar nivel
  const reiniciarNivel = () => {
    inicializarNivel();
  };

  // Siguiente nivel
  const siguienteNivel = () => {
    if (nivel < Object.keys(niveles).length) {
      setNivel(nivel + 1);
    }
  };

  // Iconos de comandos
  const iconosComandos = {
    arriba: <ArrowUp size={24} />,
    abajo: <ArrowDown size={24} />,
    izquierda: <ArrowLeft size={24} />,
    derecha: <ArrowRight size={24} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">

          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            🤖 Programando con Bloques
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            ¡Aprende a programar moviendo el robot! Arrastra los comandos para crear tu programa.
          </p>
        </div>

        {/* Info del nivel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="text-white">
              <span className="font-bold text-yellow-300">Nivel {nivel}: </span>
              {nivelActual.titulo}
            </div>
            <div className="text-blue-200">
              <Heart className="inline mr-1" size={16} />
              Puntos: <span className="font-bold text-yellow-300">{puntos}</span>
            </div>
            <div className="text-blue-200">
              Comandos: {comandos.length}/{nivelActual.maxComandos}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grilla de juego */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4 text-center">
              {nivelActual.descripcion}
            </h3>
            
            <div 
              className="grid gap-1 mx-auto bg-white/20 p-4 rounded-lg"
              style={{ 
                gridTemplateColumns: `repeat(${nivelActual.grilla}, 1fr)`,
                maxWidth: '400px'
              }}
            >
              {Array.from({ length: nivelActual.grilla * nivelActual.grilla }).map((_, index) => {
                const x = index % nivelActual.grilla;
                const y = Math.floor(index / nivelActual.grilla);
                const esRobot = posicionRobot.x === x && posicionRobot.y === y;
                const esObjetivo = nivelActual.objetivo.x === x && nivelActual.objetivo.y === y;
                const esObstaculo = nivelActual.obstaculos.some(obs => obs.x === x && obs.y === y);

                return (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 ${
                      esObstaculo ? 'bg-red-500' :
                      esObjetivo ? 'bg-yellow-400' :
                      'bg-white/30 hover:bg-white/40'
                    }`}
                  >
                    {esRobot && <span className="animate-bounce">🤖</span>}
                    {esObjetivo && !esRobot && <Star className="text-white animate-pulse" size={24} />}
                    {esObstaculo && <span>🧱</span>}
                  </div>
                );
              })}
            </div>

            {/* Controles */}
            <div className="flex justify-center gap-2 mt-4">
              <button 
                onClick={ejecutarPrograma}
                disabled={comandos.length === 0 || ejecutando}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <Play size={20} />
                {ejecutando ? 'Ejecutando...' : 'Ejecutar'}
              </button>
              
              <button 
                onClick={reiniciarNivel}
                disabled={ejecutando}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <RotateCcw size={20} />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Panel de comandos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4 text-center">Comandos de Movimiento</h3>
            
            {/* Botones de comandos */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['arriba', 'abajo', 'izquierda', 'derecha'].map((comando) => (
                <button
                  key={comando}
                  onClick={() => agregarComando(comando)}
                  disabled={comandos.length >= nivelActual.maxComandos || ejecutando}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  {iconosComandos[comando]}
                  {comando.charAt(0).toUpperCase() + comando.slice(1)}
                </button>
              ))}
            </div>

            {/* Programa actual */}
            <div className="mb-4">
              <h4 className="text-white font-bold mb-2">Tu Programa:</h4>
              <div className="bg-white/20 rounded-lg p-3 min-h-[80px]">
                {comandos.length === 0 ? (
                  <div className="text-gray-300 text-center italic">
                    Agrega comandos para crear tu programa
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {comandos.map((comando, index) => (
                      <div key={index} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        {iconosComandos[comando]}
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={eliminarComando}
              disabled={comandos.length === 0 || ejecutando}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white py-2 rounded-lg font-bold transition-all"
            >
              Eliminar Último Comando
            </button>
          </div>
        </div>

        {/* Modal de victoria */}
        {completado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Nivel Completado!</h2>
              <p className="text-gray-600 mb-4">
                ¡Excelente trabajo! Resolviste el nivel {nivel} en {intentos} intento{intentos !== 1 ? 's' : ''}.
                {intentos === 1 && " ¡Perfecto en el primer intento! 🌟"}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={reiniciarNivel}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                  Jugar de Nuevo
                </button>
                {nivel < Object.keys(niveles).length && (
                  <button 
                    onClick={siguienteNivel}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                    <Trophy size={20} />
                    Siguiente Nivel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer educativo */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-lg p-6 text-center">
          <h3 className="text-white text-lg font-bold mb-2">¿Qué aprendo programando?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-100">
            <div>
              <div className="text-yellow-300 font-bold mb-1">🧠 Lógica</div>
              <div>Pensar paso a paso para resolver problemas</div>
            </div>
            <div>
              <div className="text-yellow-300 font-bold mb-1">📝 Algoritmos</div>
              <div>Crear secuencias de instrucciones</div>
            </div>
            <div>
              <div className="text-yellow-300 font-bold mb-1">🔄 Debugging</div>
              <div>Encontrar y corregir errores</div>
            </div>
          </div>
          <div className="mt-4 text-gray-300 text-xs">
            Desarrollado por estudiantes de la ET N° 32 - Especialidad Computación
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuegoProgramacion;
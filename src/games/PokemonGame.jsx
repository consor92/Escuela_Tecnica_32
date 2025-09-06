import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, RotateCcw, Trophy, AlertCircle } from 'lucide-react';

const PokemonBinarySearchGame = () => {
  // Lista de todos los Pokémon disponibles
  const allPokemon = [
    'Alakazam', 'Arbok', 'Arcanine', 'Articuno', 'Bayleef', 'Beedrill', 'Bellsprout',
    'Blastoise', 'Bulbasaur', 'Butterfree', 'Caterpie', 'Chansey', 'Charmander',
    'Charmeleon', 'Chikorita', 'Chinchou', 'Clefairy', 'Cleffa', 'Clobbopus',
    'Cloyster', 'Cubone', 'Cufant', 'Cutiefly', 'Cyndaquil', 'Diglett', 'Ditto',
    'Doduo', 'Dondozo', 'Dragonite', 'Drednaw', 'Drowzee', 'Eevee', 'Electabuzz',
    'Electrode', 'Flareon', 'Flittle', 'Furret', 'Gastly', 'Gengar', 'Geodude',
    'Gloom', 'Golduck', 'Golem', 'Graveler', 'Grimer', 'Growlithe', 'Gyarados',
    'Happiny', 'Hattrem', 'Haunter', 'Horsea', 'Hypno', 'Jigglypuff', 'Jolteon',
    'Kabutops', 'Kadabra', 'Kakuna', 'Kangaskhan', 'Kingler', 'Koffing', 'Krabby',
    'Kubfu', 'Lapras', 'Ledian', 'Lickitung', 'Loudred', 'Machamp', 'Machop',
    'Magikarp', 'Magmar', 'Magnemite', 'Mankey', 'Meowth', 'Metapod', 'Mew',
    'Mewtwo', 'Milcery', 'Mothim', 'Mr_Mime', 'Nidoran', 'Nidorina', 'Oddish',
    'Omanyte', 'Omastar', 'Onix', 'Panpour', 'Pichu', 'Pidgey', 'Pikachu',
    'Pinsir', 'Poliwag', 'Poliwrath', 'Ponyta', 'Porygon', 'Primeape', 'Psyduck',
    'Quilava', 'Raboot', 'Rapidash', 'Rattata', 'Rhyhorn', 'Sandslash', 'Scorbunny',
    'Scyther', 'Seadra', 'Seaking', 'Seel', 'Shellder', 'Skitty', 'Slowpoke',
    'Snom', 'Snorlax', 'Sobble', 'Spearow', 'Spinarak', 'Squirtle', 'Staryu',
    'Tauros', 'Tentacool', 'Terapagos', 'Totodile', 'Tyranitar', 'Vaporeon',
    'Venonat', 'Victreebel', 'Voltorb', 'Weedle', 'Zygarde'
  ];

  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won', 'lost'
  const [targetPokemon, setTargetPokemon] = useState('');
  const [gameBoard, setGameBoard] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [boardSize, setBoardSize] = useState(32);
  const [foundPosition, setFoundPosition] = useState(-1);

  // Calcular máximo de intentos basado en búsqueda binaria
  const calculateMaxAttempts = (size) => {
    return Math.ceil(Math.log2(size)) + 2; // +2 para dar un poco más de margen
  };

  // Mezclar array usando Fisher-Yates
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inicializar nuevo juego
  const startNewGame = useCallback(() => {
    // Seleccionar boardSize Pokémon aleatoriamente y luego ordenarlos alfabéticamente
    const shuffledPokemon = shuffleArray(allPokemon);
    const selectedPokemon = shuffledPokemon
      .slice(0, boardSize)
      .sort((a, b) => a.localeCompare(b));

    // Seleccionar un Pokémon objetivo en una posición aleatoria
    const targetIndex = Math.floor(Math.random() * selectedPokemon.length);
    const target = selectedPokemon[targetIndex];

    setTargetPokemon(target);
    setGameBoard(selectedPokemon);
    setFlippedCards([]);
    setFoundPosition(targetIndex);

    const maxAttemptsCalc = calculateMaxAttempts(boardSize);
    setMaxAttempts(maxAttemptsCalc);
    setAttemptsLeft(maxAttemptsCalc);
    setGameState('playing');
  }, [boardSize]);

  // Manejar clic en carta
  const handleCardClick = (index) => {
    if (gameState !== 'playing' || flippedCards.includes(index) || attemptsLeft <= 0) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (gameBoard[index] === targetPokemon) {
      setGameState('won');
    } else {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft <= 0) {
        setGameState('lost');
        // Mostrar la carta correcta
        setTimeout(() => {
          setFlippedCards(prev => [...prev, foundPosition]);
        }, 1000);
      }
    }
  };

  // Componente de carta
  const Card = ({ pokemon, index, isFlipped, isTarget, isCorrect }) => {
    const getImagePath = (pokemonName) => {
      return `/Pokemones/${pokemonName}.png`;
    };

    const getCardClasses = () => {
      let classes = "relative w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-lg rounded-xl";

      if (isCorrect) {
        classes += " ring-4 ring-green-400 shadow-green-400/50";
      } else if (isTarget && gameState === 'lost') {
        classes += " ring-4 ring-red-400 shadow-red-400/50";
      }

      return classes;
    };

    return (
      <div 
        className={getCardClasses()}
        onClick={() => handleCardClick(index)}
        style={{ perspective: '1000px' }}
      >
        <div 
          className="relative w-full h-full transition-transform duration-600"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Parte trasera de la carta (Pokebola) */}
          <div 
            className="absolute inset-0 rounded-xl flex items-center justify-center"
            style={{ 
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #ef4444, #2563eb)'
            }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-gray-800"></div>
            </div>
          </div>
          
          {/* Parte delantera de la carta (Pokémon) */}
          <div 
            className="absolute inset-0 rounded-xl bg-white border-2 border-gray-300 overflow-hidden p-1 flex flex-col"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <img 
              src={getImagePath(pokemon)}
              alt={pokemon}
              className="flex-1 w-full object-contain"
              style={{ height: '50px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'flex-1 w-full flex items-center justify-center text-gray-500 text-xs';
                fallback.innerHTML = pokemon.replace('_', ' ');
                e.target.parentNode.appendChild(fallback);
              }}
            />
            <div className="text-center py-1">
              <span className="text-xs font-semibold text-gray-700 block leading-tight">
                {pokemon.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de menú
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <img 
              src="/Pokemones/Pikachu.png" 
              alt="Pikachu" 
              style={{ width: 64, height: 64, objectFit: 'contain' }}
              className="inline-block align-middle"
            />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Búsqueda Binaria de Pokémon 
            </h1>
            <p className="text-gray-600 mb-6">
              Encuentra el Pokémon objetivo usando la lógica de búsqueda binaria
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-700">
                <strong>📚 Estrategia:</strong> Los Pokémon están ordenados alfabéticamente. 
                Usa búsqueda binaria: empieza por el centro y descarta la mitad incorrecta en cada intento.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño del tablero: {boardSize} cartas
            </label>
            <select 
              value={boardSize} 
              onChange={(e) => setBoardSize(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={16}>16 cartas (máx. 6 intentos)</option>
              <option value={32}>32 cartas (máx. 7 intentos)</option>
              <option value={64}>64 cartas (máx. 8 intentos)</option>
              <option value={128}>128 cartas (máx. 9 intentos)</option>
            </select>
          </div>

          <button 
            onClick={startNewGame}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Shuffle className="inline-block w-5 h-5 mr-2" />
            Iniciar Juego
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de juego
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Header del juego */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Pokémon objetivo */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Encuentra a:</h2>
                <div className="w-20 h-24 bg-gray-100 rounded-xl border-2 border-gray-300 overflow-hidden">
                  <img 
                    src={`/Pokemones/${targetPokemon}.png`}
                    alt={targetPokemon}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-1">{targetPokemon.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Contador de intentos */}
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-semibold text-gray-800">
                  Intentos restantes: {attemptsLeft}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(attemptsLeft / maxAttempts) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Botón de reinicio */}
            <button 
              onClick={() => setGameState('menu')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Menú
            </button>
          </div>
        </div>
      </div>

      {/* Tablero de juego */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <div className={`grid gap-2 md:gap-3 ${
            boardSize <= 16 ? 'grid-cols-4 sm:grid-cols-8' :
            boardSize <= 32 ? 'grid-cols-6 sm:grid-cols-8' :
            boardSize <= 64 ? 'grid-cols-8 sm:grid-cols-8' :
            'grid-cols-8 sm:grid-cols-8 lg:grid-cols-16 lg:gap-3'
          }`}>
            {gameBoard.map((pokemon, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center z-10 font-bold">
                  {index + 1}
                </div>

                <Card 
                  pokemon={pokemon}
                  index={index}
                  isFlipped={flippedCards.includes(index)}
                  isTarget={index === foundPosition && gameState === 'lost'}
                  isCorrect={pokemon === targetPokemon && flippedCards.includes(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de resultado */}
      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            {gameState === 'won' ? (
              <div>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-600 mb-4">¡Ganaste!</h2>
                <p className="text-gray-600 mb-6">
                  Encontraste a {targetPokemon.replace('_', ' ')} con {maxAttempts - attemptsLeft} intentos
                </p>
              </div>
            ) : (
              <div>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-600 mb-4">Perdiste</h2>
                <p className="text-gray-600 mb-6">
                  Se acabaron los intentos. {targetPokemon.replace('_', ' ')} estaba en el tablero.
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={startNewGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Jugar de nuevo
              </button>
              <button 
                onClick={() => setGameState('menu')}
                className="flex-1 bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200"
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonBinarySearchGame;

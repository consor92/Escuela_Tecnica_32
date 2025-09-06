import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import JuegoProgramacion from './games/JuegoProgramacion'
import PokemonBinarySearchGame from './games/PokemonGame'
import TorresHanoi from './games/TorresHanoi'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'programacion', element: <JuegoProgramacion /> },
      { path: 'pokemon', element: <PokemonBinarySearchGame /> },
      { path: 'hanoi', element: <TorresHanoi /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}  />
  </React.StrictMode>,
)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // permite conexiones externas
    port: 4000,
    allowedHosts: [
      'escuelatecnica32de14.edu.ar',
      'www.escuelatecnica32de14.edu.ar'
    ],
    hmr: {
      host: 'escuelatecnica32de14.edu.ar',  // o 'www.escuelatecnica32de14.edu.ar', funciona con cualquiera
      protocol: 'wss'
    }
  }
});

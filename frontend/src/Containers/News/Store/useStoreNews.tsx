import { create } from 'zustand'
import { IusestoreNewa } from './type'


const initialState: IusestoreNewa = {
  dataNews: [
    {
      id: 1,
      titulo: "",
      descripcion: "",
      link: "",
      imagen_principal: "",
      fecha: "",
      contenido: "",
      carrusel: []
    }
  ],
  lastNews: {
    id: 1,
    titulo: "",
    descripcion: "",
    link: "",
    imagen_principal: "",
    fecha: "",
    contenido: "",
    carrusel: []
  }
}

export const useStoreNews = create<IusestoreNewa>(set => ({
  ...initialState,
  setDataNews: data => set(state => ({ ...state, dataNews: data })),
  setLastNews: data => set(state => ({ ...state, lastNews: data }))
}))
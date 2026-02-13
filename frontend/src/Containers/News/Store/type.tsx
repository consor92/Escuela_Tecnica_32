interface IdataNews {
    id: number,
    titulo: string,
    descripcion: string,
    link: string,
    imagen_principal: string,
    fecha: string,
    contenido: string,
    carrusel: string[]
}

export interface IusestoreNewa {
    dataNews: IdataNews[],
    setDataNews?: (data: IdataNews[]) => void
    lastNews: IdataNews
    setLastNews?: (data: IdataNews) => void
}
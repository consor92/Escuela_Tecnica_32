export default async function noticias(req, res) {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=12");
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      const fakeData = [
        { id: "error-1", title: "Noticia por error 1", descripcion: "No se pudo obtener la noticia." },
        { id: "error-2", title: "Noticia por error 2", descripcion: "No se pudo obtener la noticia." },
        { id: "error-3", title: "Noticia por error 3", descripcion: "No se pudo obtener la noticia." },
        { id: "error-4", title: "Noticia por error 4", descripcion: "No se pudo obtener la noticia." },
        { id: "error-5", title: "Noticia por error 5", descripcion: "No se pudo obtener la noticia." },
        { id: "error-6", title: "Noticia por error 6", descripcion: "No se pudo obtener la noticia." },
        { id: "error-7", title: "Noticia por error 7", descripcion: "No se pudo obtener la noticia." },
      ];
      res.status(200).json(fakeData);
    }
  }
import { useRouter } from 'next/router';

export default function News() {
  const router = useRouter();
  const { id, titulo, contenido } = router.query;
  // const noticia = router.query.state; // objeto con información adicional sobre la noticia

  return (
    <div>
      <h1>Noticia {id}</h1>
      <h2>{titulo}</h2>
      <div dangerouslySetInnerHTML={{ __html: contenido }} />
    </div>
  );
}

import Layout from '@/Components/Layout/Layout'
import newsData from '@/data/news.json'
import useScreen from '@/Hooks/useScreen'
import { Box, Container, Typography } from '@mui/material'
import { Fade } from 'react-reveal'

export default function NewsDetail({ news }: { news: any }) {
  const { width } = useScreen()
  return (
    <>
      <Layout favicon='/logoet32.ico' title={news.titulo} page="novedades" >
        <Typography gutterBottom variant="h5" component="div" sx={{
          fontWeight: 'bold',
          fontSize: width < 768 ? '24px' : '48px',
          color: '#F9F9F9',
          display: 'flex',
          position: 'absolute',
          width: width < 768 ? 'auto' : '100vw',
          height: '300px',
          zIndex: 9,
          alignItems: 'flex-end',
          ml: 2,
          mt: 2,
        }}>
          {news.titulo}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '300px',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '2px',
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, rgba(23, 23, 21, 1), rgba(23, 23, 21, 0))',
              pointerEvents: 'none',
              zIndex: 1
            }
          }}
        >

          <Box
            component='img'
            src={news.imagen_principal}
            alt={news.titulo}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </Box>

        <Container maxWidth={false} sx={{ backgroundColor: '#171715', minHeight: '100vh', width: '100%', p: 0, m: 0, pb: 6 }}>

          <Box sx={{ display: 'flex', justifyContent: 'center', pt:6}}>
            {/* Contiene la descripcion de la noticia mapeando y ajustando estilos que provienen del .json*/}
            <Box
              sx={{
                width: width < 768 ? '100%' : '50%',
                margin: width < 768 ? '0px 32px' : '32px 0px',
                color: '#F9F9F9',
                fontSize: '16px',
                lineHeight: 1.8,
                '& p': { mb: 2 },
                '& ul': { pl: 3, my: 2 },
                '& li': { mb: 1 },
                '& strong': { fontWeight: 700 },
                '& a': { color: '#F90334', textDecoration: 'none', fontWeight: 600 },
                '& a:hover': { color: '#ff3b62' }
              }}
              dangerouslySetInnerHTML={{ __html: news.contenido }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto', mt: 6 }}>
            <Fade left duration={3000}>
              <Box
                component='img'
                src={news.imagen_principal}
                alt={news.titulo}
                sx={{
                  width: width < 768 ? 'auto' : '800px',
                  height: '550px',
                  objectFit: 'cover',
                }}
              />
            </Fade>
          </Box>

        </Container>
      </Layout>
    </>
  )
}

export async function getStaticPaths() {
  const paths = (newsData || []).map((item) => ({
    params: { id: String(item.id) }
  }))

  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const news = (newsData || []).find((item) => String(item.id) === String(params?.id)) || null

  return {
    props: {
      news
    }
  }
}



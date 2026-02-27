import { Button, Card, CardActions, CardContent, CardMedia, Container, Typography } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'
import useScreen from '@/Hooks/useScreen'

interface IdataLastNews {
  id: number,
  titulo: string,
  descripcion: string,
  link: string,
  imagen_principal: string,
  fecha: string,
  contenido: string,
  carrusel: string[]
}

type Props = {
  data: IdataLastNews
  maxWidth?: string
  width?: string
  height?: string
}

const CardCustom = ({ data, maxWidth = "100vw", width = "100vw", height = "140px" }: Props) => {
  const router = useRouter()

  const handleGoToNews = () => {
    router.push(`/news/${data.id}`)
  }

  const { titulo, descripcion, imagen_principal } = data
  const { width: screenWidth } = useScreen()
  return (
    <Card onClick={handleGoToNews} sx={{
      cursor: 'pointer',
      maxWidth: `${maxWidth}`,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      display: 'flex',
      flexDirection: screenWidth < 768 ? 'column' : 'row'
    }}>
      <CardMedia
        sx={{ height: `${height}`, width: `${width}`, backgroundPosition: 'top', backgroundSize: 'cover' }}
        image={imagen_principal}
        title={titulo}
      />
      <Container sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#F9F9F9' }}>
            {titulo}
          </Typography>
          <Typography variant="body2" sx={{ color: '#F9F9F9', fontWeight: '100', display: screenWidth < 768 ? 'none' : 'block' }}>
            {descripcion}
          </Typography>
        </CardContent>
        <CardActions sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: '100%' }}>
          {/* <Button size="small">Share</Button> */}
          <Button size="small" onClick={handleGoToNews}>Leer más</Button>
        </CardActions>
      </Container>
    </Card>
  )
}

export default CardCustom
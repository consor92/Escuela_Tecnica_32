import React from 'react'
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material'
import { useRouter } from 'next/router'

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

const CardCustomBottomDrawer = ({ data, maxWidth = "100vw", width = "100vw", height = "140px" }: Props) => {
  const router = useRouter()

  const handleGoToNews = () => {
    router.push(`/news/${data.id}`)
  }

	const { titulo, imagen_principal } = data

	return (
		<Card onClick={handleGoToNews} sx={{ cursor: 'pointer', maxWidth: `${maxWidth}`, backgroundColor: 'transparent', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
			<CardMedia
				sx={{ height: `${height}`, width: `${width}`, backgroundSize: 'cover' }}
				image={imagen_principal}
				title={titulo}
			/>
			<Box sx={{ p: 0, m: 0 }}>
				<CardContent sx={{ p: 0, m: 0}}>
					<Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#F9F9F9', m: 0,mt: 1 }}>
						{titulo}
					</Typography>
				</CardContent>
				<CardActions sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', p: 0, m: 0, mt: 1 }}>
					<Button size="small" sx={{ p: 0, minWidth: 'auto' }} onClick={handleGoToNews}>Leer más</Button>
				</CardActions>
			</Box>
		</Card>
	)
}

export default CardCustomBottomDrawer
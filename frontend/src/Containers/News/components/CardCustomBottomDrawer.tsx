import React from 'react'
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box, Container } from '@mui/material'
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
	news: IdataLastNews[] // Array de noticias para mostrar en el drawer
	currentNews?: number // ID de la noticia PRINCIPAL mostrada (para excluirla del drawer)
	maxWidth?: string
	width?: string
	height?: string
}

const CardCustomBottomDrawer = ({ news, currentNews, maxWidth = "100vw", width = "100vw", height = "140px" }: Props) => {
	const router = useRouter()
	const handleGoToNews = (route: number) => {
		router.push(`/news/${route}`)
	}

	return (
		<Container sx={{ width: '100%' }}>
			<Box sx={{
				display: 'grid',
				width: '100%',
				gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))' },
				gridAutoFlow: 'row',
				gap: 3,
				alignItems: 'start'
			}}>
				{news.filter((item) => item.id !== currentNews).map((c) =>
					(<Card key={c.id} onClick={() => handleGoToNews(c.id)} sx={{ cursor: 'pointer', maxWidth: `${maxWidth}`, backgroundColor: 'transparent', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
						<CardMedia
							sx={{ height: `${height}`, width: `${width}`, backgroundSize: 'cover' }}
							image={c.imagen_principal}
							title={c.titulo}
						/>
						<Box sx={{ p: 0, m: 0 }}>
							<CardContent sx={{ p: 0, m: 0 }}>
								<Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#F9F9F9', m: 0, mt: 1 }}>
									{c.titulo}
								</Typography>
							</CardContent>
							<CardActions sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', p: 0, m: 0, mt: 1 }}>
								<Button size="small" sx={{ p: 0, minWidth: 'auto' }} onClick={() => handleGoToNews(c.id)}>Leer más</Button>
							</CardActions>
						</Box>
					</Card>
					))
				}
			</Box>
		</Container>
	)
}

export default CardCustomBottomDrawer
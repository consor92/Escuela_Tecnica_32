import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material'
import React from 'react'

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

const CardCustom = ({ data, maxWidth = "345px", width = "345px", height = "140px" }: Props) => {

	const { id, titulo, descripcion, link, imagen_principal, fecha, contenido, carrusel } = data
	return (
		<Card sx={{ maxWidth: `${maxWidth}`, backgroundColor: 'transparent', boxShadow: 'none', }}>
			<CardMedia
				sx={{ height: `${height}`, width: `${width}` }}
				image={imagen_principal}
				title={titulo}
			/>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#F9F9F9' }}>
					{titulo}
				</Typography>
				<Typography variant="body2" sx={{ color: '#F9F9F9', fontWeight: '100' }}>
					{descripcion}
				</Typography>
			</CardContent>
			<CardActions sx={{
				position: 'relative', backgroundColor: 'transparent', borderLeft: '2px solid #F9F9F9',
				'&::after': {
					content: '""',
					position: 'absolute',
					left: 0,            // desde dónde arranca
					bottom: 0,
					width: '180px',     // <-- LARGO de la línea
					height: '2px',      // grosor
					backgroundColor: '#F9F9F9',
					zIndex: 1,
				},
			}}>
				{/* <Button size="small">Share</Button> */}
				<Button size="small">Leer más</Button>
			</CardActions>
		</Card>
	)
}

export default CardCustom
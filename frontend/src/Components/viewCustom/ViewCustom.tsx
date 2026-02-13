import React from 'react'
import { Container } from '@mui/system'
import styles from './ViewCustom.module.css'

interface Props {
	image: string
	children?: React.ReactNode
	bgColor?: 'blue' | 'red' | 'black' | 'white'
}

const ViewCustom = ({ image, children, bgColor = 'blue' }: Props) => {
	const overlayMap: Record<NonNullable<Props['bgColor']>, string> = {
		blue: '#191D62',
		red: '#F90334',
		black: '#171715',
		white: '#F9F9F9',
	}
	const overlayColor = overlayMap[bgColor]
	return (
		<>
			<Container
				className={styles.container}
				maxWidth={false}
				sx={{
					'--overlay-color': overlayColor,
					backgroundImage: `url(${image})`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					height: '100vh',
					width: '100vw',
					padding: '0px',
					margin: '0px',
				} as any}
			>
				<Container sx={{ position: 'relative', zIndex: '1', height: '100%' }}>
					{children}
				</Container>
			</Container >
		</>
	)
}

export default ViewCustom
import { ButtonCustom, ViewCustom } from '@/Components'
import React from 'react'
import WithNewsContainer from './Hooks/withNewsContainer'
import { IwithNewsContainer } from './Hooks/type'
import { useStoreNews } from './Store/useStoreNews'
import { Box, Container, Button, Typography } from '@mui/material'
import { CardCustom, CardCustomBottomDrawer } from './components'
import useScreen from '@/Hooks/useScreen'

const NewsContainer = ({ bgHome }: IwithNewsContainer) => {
  const { dataNews, lastNews } = useStoreNews()
  const { width } = useScreen()
  return (
    <ViewCustom image={bgHome} bgColor='black' fullHeight={false}>
      <Typography variant="h5" component="div" sx={{
        fontSize: width < 768 ? '24px' : '48px',
        color: '#F9F9F9',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        py: 4,
      }}>
        <Box sx={{
          fontWeight: '100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: 'solid 3px var(--background--redIntense)',
          width: '10%',
        }}>
          Noticias
        </Box>
      </Typography>
      <Container sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'calc(100vh - 80px)', md: '100%' },
        width: '100%',
        justifyContent: { xs: 'flex-start', md: 'center' },
        alignItems: 'center',
        gap: 4, pt: { xs: 12, md: 4 }, pb: 4
      }}>
        {width > 768 && <Container sx={{ width: '100%' }}>{/* Mostrar solo la noticia principal en pantallas grandes */}
          <CardCustom
            data={lastNews}
            width='50%'
            height='330px'
          />
        </Container>}
        <CardCustomBottomDrawer
          news={dataNews}
          currentNews={lastNews?.id}
          width='100%'
          height="150px" />
        {/* <ButtonCustom description='Mas Noticias' size='large' fontSize='20px' /> */}
      </Container>
    </ViewCustom >
  )
}

export default WithNewsContainer(NewsContainer)

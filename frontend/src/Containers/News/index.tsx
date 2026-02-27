import { ButtonCustom, ViewCustom } from '@/Components'
import React from 'react'
import WithNewsContainer from './Hooks/withNewsContainer'
import { IwithNewsContainer } from './Hooks/type'
import { useStoreNews } from './Store/useStoreNews'
import { Box, Container, Button } from '@mui/material'
import { CardCustom, CardCustomBottomDrawer } from './components'
import useScreen from '@/Hooks/useScreen'

const NewsContainer = ({ bgHome }: IwithNewsContainer) => {
  const { dataNews, lastNews } = useStoreNews()
  const { width } = useScreen()
  return (
    <ViewCustom image={bgHome} bgColor='black' fullHeight={false}>
      <Container sx={{ display: 'flex', 
        flexDirection: 'column', 
        minHeight: { xs: 'calc(100vh - 80px)', md: '100%' },
         width: '100%', 
         justifyContent: { xs: 'flex-start', md: 'center' }, 
         alignItems: 'center', 
         gap: 4, pt: { xs: 12, md: 4 }, pb: 4 }}>
        {width > 768 && <Container sx={{ width: '100%' }}>
          <CardCustom
            data={lastNews}
            width='50%'
            height='330px'
          />
        </Container>}
        <Container sx={{ width: '100%' }}>
          <Box sx={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
            alignItems: 'start'
          }}>
            {dataNews
              .filter((item) => item.id !== (width > 768 ? lastNews?.id : null))
              .map((item) => (
                <Box key={item.id} sx={{ width: '100%' }}>
                  <CardCustomBottomDrawer data={item} width='100%' height="150px" />
                </Box>
              ))}
          </Box>
        </Container>
        <ButtonCustom description='Mas Noticias' size='large' fontSize='20px' />
      </Container>
    </ViewCustom >
  )
}

export default WithNewsContainer(NewsContainer)

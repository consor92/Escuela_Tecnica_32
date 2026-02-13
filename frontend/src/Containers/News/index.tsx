import { ViewCustom } from '@/Components'
import React from 'react'
import WithNewsContainer from './Hooks/withNewsContainer'
import { IwithNewsContainer } from './Hooks/type'
import { useStoreNews } from './Store/useStoreNews'
import { Box, Container, List, ListItem } from '@mui/material'
import CardCustom from './components/CardCustom'

const NewsContainer = ({ bgHome }: IwithNewsContainer) => {
  const { dataNews, lastNews } = useStoreNews()

  return (
    <ViewCustom image={bgHome} bgColor='black'>
      <Container sx={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Container sx={{ width: '50%' }}>
          <CardCustom
            data={lastNews}
            maxWidth='800px'
            width='500px'
            height='400px'
          />
        </Container>
        <Container sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <Box />

          <List
            sx={{
              height: 400,
              width: 360,
              overflowY: 'auto',
              p: 0,
            }}
          >
            {dataNews
              .filter((item) => item.id !== lastNews?.id)
              .map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 2 }}>
                  <CardCustom data={item} maxWidth="360px" width="360px" height="180px" />
                </ListItem>
              ))}
          </List>
          <Box />
        </Container>
      </Container>
    </ViewCustom >
  )
}

export default WithNewsContainer(NewsContainer)

import { Box, Container, height } from '@mui/system'
import React from 'react'
import { ViewCustom } from '../../Components'
import { Typography } from '@mui/material'
import useScreen from '@/Hooks/useScreen'
const HomeContainer = () => {
  const bgHome = new URL(`../../Assets/Images/bg__HomeIndex.png`, import.meta.url).href
  const { width } = useScreen()  
  return (
    <>
      <ViewCustom image={bgHome}>
        <Box sx={{  height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant='h1' sx={{ fontSize: width < 768 ? '2rem' : '3rem', fontWeight: 'bold', color: '#fff' }} gutterBottom>FORMANDO</Typography>
          <Typography variant='h2' sx={{ fontSize: width < 768 ? '2rem' : '3rem', fontWeight: 'bold', color: '#fff' }} gutterBottom>A LOS</Typography>
          <Typography variant='h2' sx={{ fontSize: width < 768 ? '2rem' : '3rem', fontWeight: 'bold', color: '#fff' }} gutterBottom>JÓVENES DEL MAÑANA.</Typography>
        </Box>
      </ViewCustom>
    </>
  )
}

export default HomeContainer
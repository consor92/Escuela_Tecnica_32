import { Inter } from 'next/font/google'
import Novedades from '../Components/Novedades/Novedades'
import Layout from '@/Components/Layout/Layout'
import HomeIndex from '@/Components/HomeIndex/HomeIndex'
import Disciplines from '@/Components/Disciplines/Disciplines'
import Section from '@/Components/Secciones/Section.jsx'
import { getDisciplineItem } from '@/Service/DisciplineItem'
import Inscripciones from '@/Components/Inscripciones/Inscripciones'
import Cooperadora from '@/Components/Cooperadora/Cooperadora'
import { Footer } from '@/Components/Footer/Footer'
import TestCalendarModal from '../Components/TestCalendarModal';

const inter = Inter({ subsets: ['latin'] })

export default function Home({ item }) {
  return (
    <>
      <Layout
        title={'ET 32 "Gral José de San Martín"'}
        favicon='/logoet32.ico'
        page="home"
      ></Layout>
      <HomeIndex />
      <TestCalendarModal />
      <div id="novedades">
        <Novedades />
      </div>
      <Disciplines
        props={item}
        showAs='allDisciplines' />
      <Inscripciones />
      <Section />
      <Cooperadora />
      <Footer />
    </>
  )
}

export async function getStaticProps() {
  const res = await getDisciplineItem()
  return {
    props: {
      item: res
    }
  }
}

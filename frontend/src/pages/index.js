import { Inter } from 'next/font/google'
import NewsCards from '../Components/NewsSection/NewsCards'
import Layout from '@/Components/Layout/Layout'
import HomeIndex from '@/Components/HomeIndex/HomeIndex'
import Disciplines from '@/Components/Disciplines/Disciplines'
import Section from '@/Components/Secciones/Section.jsx'
import { getDisciplineItem } from '@/Service/DisciplineItem'
import Inscripciones from '@/Components/inscripciones/Inscripciones'
import Cooperadora from '@/Components/cooperadora/Cooperadora'
import { Footer } from '@/Components/Footer/Footer'
import TestCalendarModal from '../Components/TestCalendarModal.client';
import { HomeContainer, NewsContainer } from '@/Containers'

const inter = Inter({ subsets: ['latin'] })

export default function Home({ item }) {
  return (
    <>
      <Layout
        title={'Escuela Tecnica 32 DE14 "Gral Jose de San Martin"'}
        favicon='/logoet32.ico'
        page="home"
      >
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000 }}>
          <TestCalendarModal />
        </div>
        {/* <HomeIndex /> */}
        {/* <NewsCards /> */}
        <HomeContainer />
        <NewsContainer />
        <Disciplines
          props={item}
          showAs='allDisciplines' />
        <Inscripciones />
        <Section />
        <Cooperadora />
        <Footer />
      </Layout>
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


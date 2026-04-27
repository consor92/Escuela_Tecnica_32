import Layout from '@/Components/Layout/Layout'
import Novedades from '@/Components/Novedades/Novedades'
import styles from './NovedadesPage.module.css'

export default function AllNews(){
  return (
    <Layout title="Novedades" page="novedades">
      <div className={styles.container}>
        <Novedades showAll={true} />
      </div>
    </Layout>
  )
}

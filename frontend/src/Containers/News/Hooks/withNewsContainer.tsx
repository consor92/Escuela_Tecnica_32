import React, { useEffect } from 'react'
import dataMock from '../../../data/news.json'
import { useStoreNews } from '../Store/useStoreNews'

const WithNewsContainer = (Components: React.ComponentType<any>) => (props: any) => {
	const { setDataNews, setLastNews, dataNews } = useStoreNews()
	const bgHome = new URL(`../../../Assets/Images/bg_disciplines.png`, import.meta.url).href


	function handleListDataNewsAndLastNews() {
		if (!dataMock.length) return
		const list = dataMock.map(item => ({
			id: item.id,
			titulo: item.titulo,
			descripcion: item.descripcion,
			link: item.link,
			imagen_principal: item.imagen_principal,
			fecha: item.fecha,
			contenido: item.contenido,
			carrusel: item.carrusel

		}))
		const last = list.reduce((best, item) => (item.fecha > best.fecha ? item : best), list[0])
		setDataNews?.(list)
		setLastNews?.(last)
	}


	useEffect(() => {
		handleListDataNewsAndLastNews()
	}, [])

	const action = { bgHome }

	return <Components {...action}{...props} />


}

export default WithNewsContainer
import { getDisciplineItem } from "@/Service/DisciplineItem";

export async function getPathsFromId() { // esta funcion permite obtener los ids de nuestar API local para permitir la ruta dinamica
	const items = await getDisciplineItem()
	const ids = items.map(item => {
		return {
			params: {
				id: item.id
			}
		}
	})

	return ids
}

export async function getItemData(id) {
	const items = await getDisciplineItem()
	return items.find(item => item.id === id)
}
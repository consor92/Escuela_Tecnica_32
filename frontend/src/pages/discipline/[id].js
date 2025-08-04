import Disciplines from '@/Components/Disciplines/Disciplines';
import Layout from "@/Components/Layout/Layout";
import { getItemData, getPathsFromId } from "@/lib/utils";

export default function DisciplinePage({ item }) {
	return (
		<>
			<Layout
			title={item.title}
			favicon={item.favicon}
			>
				<Disciplines
					props={item}
					showAs='discipline' />
			</Layout>
		</>
	)
}

export async function getStaticPaths() {
	const paths = await getPathsFromId()
	return {
		paths: paths,
		fallback: false,
	}
}


export async function getStaticProps({ params }) {
	const id = params.id
	const res = await getItemData(id)
	return {
		props: {
			item: res
		}
	}
}
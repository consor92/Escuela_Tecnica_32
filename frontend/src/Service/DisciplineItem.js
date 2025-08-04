import disciplineData from "../pages/api/item";

export async function getDisciplineItem() {
  return disciplineData;
}


// const res = await axios.get('http//localhost:3000/api/item')//LLamada a API local que contiene la info de las especialidades
// return res   
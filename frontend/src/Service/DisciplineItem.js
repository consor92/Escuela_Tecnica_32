import { readData } from '../lib/dataLoader';

export async function getDisciplineItem() {
  return readData('disciplines.json');
}
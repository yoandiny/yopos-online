import { Company, PointOfSale } from '../types';

let currentCompany: Company | null = null;
let currentPos: PointOfSale | null = null;

export const authState = {
  setAuth: (company: Company | null, pos: PointOfSale | null) => {
    currentCompany = company;
    currentPos = pos;
  },
  getAuth: () => {
    return { company: currentCompany, pos: currentPos };
  },
};

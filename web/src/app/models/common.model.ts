export interface DropDownModel {
  id?: string | null;
  name?: string;
  isPrimary?: boolean;
}

export interface FilterDataModel {
  pageIndex: number;
  pageSize: number;
  searchValue: string;
  clientCode?: string;
  orderByColumn: string;
  orderBy: string;
  levelCode: string;
  loggedUser: string;
}
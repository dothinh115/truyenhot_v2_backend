export type TQuery = {
  fields: string;
  filter: object;
  limit: number;
  page: number;
  meta: string;
  sort: string;
};

export type TPopulate = {
  path?: string;
  populate?: any;
  select?: string;
};

export type TImageQuery = {
  width: string;
  height: string;
  format: 'jpeg' | 'webp' | 'png';
};

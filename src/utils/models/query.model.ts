export type TQuery = {
  fields: string;
  filter: object;
  limit: number;
  page: number;
  meta: string;
};

export type TPopulate = {
  path?: string;
  populate?: any;
  select?: string;
};

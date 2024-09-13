export type TimeStamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type AutoProperty = TimeStamps & {
  id: number;
};

export type Pagination = {
  page: number;
  limit: number;
};

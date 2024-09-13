export type TimeStamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type AutoProperty = TimeStamps & {
  id: number;
};

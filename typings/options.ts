export interface Base {
  debug?: boolean;
}

export interface Clean extends Base {
  //TODO
}

export interface Render extends Base {
  dpi?: number;
  pageSize?: string;
  orientation?: ('portrait' | 'landscape');
  layout: (1 | 2 | 4 | 6);
  margin: (string|number);
}

export type Options<T> = {
  [P in keyof T]?: T[P];
};

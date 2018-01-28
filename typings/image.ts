export interface Image {
  src: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  buffer?: Buffer;
}

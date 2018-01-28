interface Size {
  width?: number;
  height?: number;
}

export class Scaler {
  private __width: number;
  private __height: number;
  private _width: number;
  private _height: number;
  private _ratio: number;

  constructor(width: number, height: number) {
    this.__width = width;
    this.__height = height;
    this.width = width;
    this.height = height;
  }

  public get width(): number {
    return this._width;
  }

  public set width(width: number) {
    this._width = width;
    this.refresh();
  }

  public get height(): number {
    return this._height;
  }

  public set height(height: number) {
    this._height = height;
    this.refresh();
  }

  public get size(): Size {
    return {
      width: this._height,
      height: this._width,
    }
  }

  public set size(size: Size) {
    this._width = size.width;
    this._height = size.height;
    this.refresh();
  }

  private refresh(): void {
    this._ratio = (this._width / this._height);
  }

  public reset(): Scaler {
    this.size = {
      width: this.__width,
      height: this.__height,
    };

    return this;
  }

  public scaleTo(params: Size): Scaler {
    if(params.width) {
      this._width = params.width;
      this._height = (params.width / this._ratio);
    } else {
      this._width = (params.height * this._ratio);
      this._height = params.height;
    }

    return this;
  }
}

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
    this.size = {
      width: width,
      height: height,
    };
  }

  public get width(): number {
    return this._width;
  }

  public set width(width: number) {
    this._width = width;
  }

  public get height(): number {
    return this._height;
  }

  public set height(height: number) {
    this._height = height;
  }

  public get size(): Size {
    return {
      width: this._width,
      height: this._height,
    }
  }

  public set size(size: Size) {
    this.__width = size.width;
    this.__height = size.height;
    this._width = size.width;
    this._height = size.height;
    this.refresh();
  }

  private refresh(): void {
    this._ratio = (this.__width / this.__height);
  }

  public reset(): Scaler {
    this.size = {
      width: this.__width,
      height: this.__height,
    };

    return this;
  }

  public scaleTo(params: Size): Scaler {
console.log(params)
    if(params.width) {
      this._width = params.width;
      this._height = (params.width / this._ratio);
console.log([params.width, this._ratio, this._width, this._height]);
    } else {
      this._width = (params.height * this._ratio);
      this._height = params.height;
    }

    return this;
  }
}

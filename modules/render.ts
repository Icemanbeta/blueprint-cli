import * as fs from 'fs';
import * as sizeOf from 'image-size';
import * as PDFDocument from 'pdfkit';
import { chunk, keys, merge, pick } from 'lodash';

import { Scaler } from './scaler';
import { Image, Options, Render as Render$ } from '../typings';
import { PageSize } from './enums';

let defaults: Options<Render$> = {
  pageSize: 'letter',
  orientation: 'portrait',
  layout: 4,
  dpi: 72,
  margin: '1in',
};

class Render {
  private options: Options<Render$>
  private images: Array<Image>;
  private page = {
    orientation: null as string,
    size: null as string,
    margin: 36,
  };

  constructor(files: Array<string>, options: Options<Render$>) {
    this.import(files);
    this.setup(options);
  }

  setOptions(options: Options<Render$>) {
    this.options = merge({}, defaults, pick(options, keys(defaults)));
    this.options.pageSize = this.options.pageSize.toUpperCase();
  }

  setup(options: Options<Render$>): void {
    this.setOptions(options);

    this.page.orientation = this.options.orientation;
    this.page.size = PageSize[this.options.pageSize];
    this.page.margin = this.toPx(this.options.margin);
  }

  import(files: Array<string>) {
    let dimensions;

    this.images = files.map(file => {
      dimensions = sizeOf(file);

      return <Image>{
        src: file,
        width: dimensions.width,
        height: dimensions.height
      }
    });
  }

  private titleize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private toPx(value: string|number): number {
    value = parseFloat(
      value
        .toString()
        .replace(/[^.0-9]/g, '')
    );

    return (value * this.options.dpi);
  }

  generate(): Array<Array<Image>> {
    let pages = [],
        count = Math.ceil(this.images.length / 4),
        document = {
          width: this.toPx('8.5in'),
          height: this.toPx('11in'),
          margin: {
            x: (this.page.margin * 2),
            y: (this.page.margin * 2),
          },

          image: {
            width: 0,
            height: 0,
          }
        };

    document.image.width = ((document.width - document.margin.x) / 2);
    document.image.height = ((document.height - document.margin.y) / 2);
console.log(document);
    this.images = this.images.map(image => {
      const scaler = new Scaler(image.width, image.height);
      let size,
          isFit;

      // size = scaler.scaleTo({ width: document.image.width }).size;
      // isFit = (size.height <= document.image.height);
      //
      // if(!isFit) {
        size = scaler.scaleTo({ width: document.image.height }).size;
      // }

      return merge({}, image, {
        width: size.width,
        height: size.height
      });
    });

    return chunk(this.images, this.options.layout);
  }

  public export(filename: string): void {
    const pages = this.generate();
    let doc = new PDFDocument({
          size: this.page.size,
          margin: this.page.margin,
          autoFirstPage: false,
          info: {
            Title: this.titleize(filename),
            Author: 'B3T4 Blueprint',
            Subject: 'B3T4 Lego',
          }
        }),

        width = 0,
        height = 0,
        x = 0,
        y = 0;

    doc.pipe(
      fs.createWriteStream(`${filename}.pdf`)
    );

    pages.forEach((page, intPage) => {
      doc.addPage();
      doc.switchToPage(intPage);

      page.forEach((image, intImage) => {
        switch(intImage) {
          case 0:
            x = (this.page.margin / 2);
            y = (this.page.margin * 2);
            break;

          case 1:
            x = (this.page.margin / 2);
            y += height;
            break;

          case 2:
            x += width;
            y = (this.page.margin * 2);
            break;

          case 3:
            y += height;
            break;
        }

        width = image.width;
        height = image.height;
console.log([intImage, x, y]);
        doc.image(image.src, {
          //width: image.width,
          height: image.height,
          x: x,
          y: y,
        });
      });
    });

    doc.flushPages();
    doc.end();

    console.log('Your Blueprint instructions has been successfully rendered!')
    console.log('Waiting for file to finish its file output stream...');
  }
}

export function render(images: Array<string>, filename: string, options: Options<Render$>) {
  let renderer = new Render(images, options);

  renderer.export(filename);
};

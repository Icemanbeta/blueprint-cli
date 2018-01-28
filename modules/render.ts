import { eachOf } from 'async';
import * as fs from 'fs';
import * as gm from 'gm';
import * as path from 'path';
import * as process from 'process';
import * as sizeOf from 'image-size';
import { chunk, keys, merge, pick } from 'lodash';
import * as PDFDocument from 'pdfkit';

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
  private _ready = false;
  private doc: PDFDocument;
  private options: Options<Render$>
  private images: Array<Image>;
  private page = {
    orientation: null as string,
    size: null as string,
    margin: 36,
  };

  constructor(files: Array<string>, options: Options<Render$>, name: string = 'tmp') {
    options.name = name;
    this.setup(files, options);
  }

  setOptions(options: Options<Render$>) {
    this.options = merge({}, defaults, pick(options, keys(defaults)));
    this.options.pageSize = this.options.pageSize.toUpperCase();
  }

  setup(files: Array<string>, options: Options<Render$>): void {
    let source,
        targetDir,
        target;

    this.setOptions(options);

    this.page.orientation = this.options.orientation;
    this.page.size = PageSize[this.options.pageSize];
    this.page.margin = this.toPx(this.options.margin);

    this.images = files.map(file => {
      source = path.parse(file);
      target = {
        dir: path.join(source.dir, options.name),
        base: source.base,
      };

      // Create backup directory
      if(!fs.existsSync(target.dir)) {
        fs.mkdirSync(target.dir);
      }

      // Make backup copy of image
      fs.copyFileSync(file, path.join(target.dir, target.base));
      // Transform to object
      return <Image>{
        src: file,
        width: 0,
        height: 0,
      };
    });
  }

  import(cb: Function = () => {}) {
    let images = this.images;

    console.log('Processing images...');

    eachOf(this.images, (image, intImage, callback) => {
        console.log(`Auto-cropping image model: ${intImage + 1}/${images.length}......`);

        gm(image.src)
        .trim()
        .quality(100)
        .write(image.src, (error, size) => {
          !error ? callback() : callback(error);
        });
    }, error => {
      console.log('Getting updated image sizes...');

      images = images.map((image, intImage) => {
        const size = sizeOf(image.src);

        image.width = size.width;
        image.height = size.height;

        if(intImage == images.length) {
          //cb();
        }

        return image;
      });

      cb();
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

  private isPortrait(image: Image) {
    return (image.height > image.width);
  }

  private isLandscape(image: Image) {
    return (image.width > image.height);
  }

  generate(): Array<Array<Image>> {
    let pages = [[]],
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
        },

        space = {
          x: document.width,
          y: document.height,
        },

        intPage = 0;

    document.image.width = (document.width - document.margin.x);
    document.image.height = (document.height - document.margin.y);

    this.images = this.images.map(image => {
      const scaler = new Scaler(image.width, image.height);
      let size,
          addPage = function() {
            space.y = document.height;
            pages.push([]);
            intPage++;
          },

          resizeLandscape = function() {
            size = scaler.scaleTo({ width: document.image.width }).size;
            space.y -= size.height;
          },

          page,
          isFit;

      if(this.isLandscape(image)) {
        size = scaler.scaleTo({ width: document.image.width }).size;

        // Check to see if it fits
        if(space.y >= size.height) {
          scaler.reset();
          resizeLandscape();
        } else {
          addPage();
          resizeLandscape();
        }
      } else {
        size = scaler.scaleTo({ height: document.image.height }).size;
        addPage();
      }

      page = merge({}, image, {
        width: size.width,
        height: size.height
      });

      pages[intPage].push(page);

      return page;
      // size = scaler.scaleTo({ width: document.image.width }).size;
      // isFit = (size.height <= document.image.height);
      //
      // if(!isFit) {
        // size = scaler.scaleTo({ width: document.image.height }).size;
      // }
    });

    // return chunk(this.images, this.options.layout);
    return pages;
  }

  public export(filename: string): void {
    const run = () => {
      this.doc = new PDFDocument({
        size: this.page.size,
        margin: this.page.margin,
        autoFirstPage: false,
        info: {
          Title: this.titleize(filename),
          Author: 'B3T4 Blueprint',
          Subject: 'B3T4 Lego',
        }
      });

      const doc = this.doc,
            pages = this.generate();
      let width = 0,
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

          doc.image(image.src, {
            width: image.width,
            // height: image.height,
            align: 'center',
            // x: x,
            // y: y,
          });
        });
      });

      doc.flushPages();
      doc.end();

      console.log('Your Blueprint instructions has been successfully rendered!')
      console.log('Waiting for file to finish its file output stream...');
    };

    // Run export if no error
    this.import(run);
  }
}

export function render(images: Array<string>, filename: string, options: Options<Render$>) {
  let renderer = new Render(images, options, filename);
  renderer.export(filename);
};

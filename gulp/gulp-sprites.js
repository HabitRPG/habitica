import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import spritesmith from 'gulp.spritesmith';
import clean from 'rimraf';
import sizeOf from 'image-size';
import mergeStream from 'merge-stream';
import {basename} from 'path';
import {sync} from 'glob';
import {each} from 'lodash';

// https://github.com/Ensighten/grunt-spritesmith/issues/67#issuecomment-34786248
const MAX_SPRITESHEET_SIZE = 1024 * 1024 * 3;
const DIST_PATH = 'website/assets/sprites/dist/';

gulp.task('sprites:compile', ['sprites:clean', 'sprites:main', 'sprites:largeSprites', 'sprites:checkCompiledDimensions']);

gulp.task('sprites:main', () => {
  let mainSrc = sync('website/assets/sprites/spritesmith/**/*.png');
  return createSpritesStream('main', mainSrc);
});

gulp.task('sprites:largeSprites', () => {
  let largeSrc = sync('website/assets/sprites/spritesmith_large/**/*.png');
  return createSpritesStream('largeSprites', largeSrc);
});

gulp.task('sprites:clean', (done) => {
  clean(`${DIST_PATH}spritesmith*`, done);
});

gulp.task('sprites:checkCompiledDimensions', ['sprites:main', 'sprites:largeSprites'], () => {
  console.log('Verifiying that images do not exceed max dimensions');

  let numberOfSheetsThatAreTooBig = 0;

  let distSpritesheets = sync(`${DIST_PATH}*.png`);

  each(distSpritesheets, (img, index) => {
    let spriteSize = calculateImgDimensions(img);

    if (spriteSize > MAX_SPRITESHEET_SIZE) {
      numberOfSheetsThatAreTooBig++;
      let name = basename(img, '.png');
      console.error(`WARNING: ${name} might be too big - ${spriteSize} > ${MAX_SPRITESHEET_SIZE}`);
    }
  });

  if (numberOfSheetsThatAreTooBig > 0) {
    console.error(`${numberOfSheetsThatAreTooBig} sheets might too big for mobile Safari to be able to handle them, but there is a margin of error in these calculations so it is probably okay. Mention this to an admin so they can test a staging site on mobile Safari after your PR is merged.`); // https://github.com/HabitRPG/habitrpg/pull/6683#issuecomment-185462180
  } else {
    console.log('All images are within the correct dimensions');
  }
});

function createSpritesStream (name, src) {
  let spritesheetSliceIndicies = calculateSpritesheetsSrcIndicies(src);
  let stream = mergeStream();

  each(spritesheetSliceIndicies, (start, index) => {
    let slicedSrc = src.slice(start, spritesheetSliceIndicies[index + 1]);

    let spriteData = gulp.src(slicedSrc)
      .pipe(spritesmith({
        imgName: `spritesmith-${name}-${index}.png`,
        cssName: `spritesmith-${name}-${index}.css`,
        algorithm: 'binary-tree',
        padding: 1,
        cssTemplate: 'website/assets/sprites/css/css.template.handlebars',
        cssVarMap: cssVarMap
      }));

    let imgStream = spriteData.img
      .pipe(imagemin())
      .pipe(gulp.dest(DIST_PATH));

    let cssStream = spriteData.css
      .pipe(gulp.dest(DIST_PATH));

    stream.add(imgStream);
    stream.add(cssStream);
  });

  return stream;
}

function calculateSpritesheetsSrcIndicies (src) {
  let totalPixels = 0;
  let slices = [0];

  each(src, (img, index) => {
    let imageSize = calculateImgDimensions(img, true);
    totalPixels += imageSize;

    if (totalPixels > MAX_SPRITESHEET_SIZE) {
      slices.push(index - 1);
      totalPixels = imageSize;
    }
  });

  return slices;
}

function calculateImgDimensions (img, addPadding) {
  let dims = sizeOf(img);

  let requiresSpecialTreatment = checkForSpecialTreatment(img);
  if (requiresSpecialTreatment) {
    let newWidth = dims.width < 90 ? 90 : dims.width;
    let newHeight = dims.height < 90 ? 90 : dims.height;
    dims = {
      width: newWidth,
      height: newHeight,
    };
  }

  let padding = 0;

  if (addPadding) {
    padding = (dims.width * 8) + (dims.height * 8);
  }

  if (!dims.width || !dims.height) console.error('MISSING DIMENSIONS:', dims);

  let totalPixelSize = (dims.width * dims.height) + padding;

  return totalPixelSize;
}

function checkForSpecialTreatment (name) {
  let regex = /^hair|skin|beard|mustach|shirt|flower|^headAccessory_special_\w+Ears|^eyewear_special_\w+TopFrame/;
  return name.match(regex) || name === 'head_0';
}

function cssVarMap (sprite) {
  // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class, which works as a
  // 60x60 image pointing at the proper part of the 90x90 sprite.
  // We set up the custom info here, and the template makes use of it.
  let requiresSpecialTreatment = checkForSpecialTreatment(sprite.name);
  if (requiresSpecialTreatment) {
    sprite.custom = {
      px: {
        offset_x: `-${ sprite.x + 25 }px`,
        offset_y: `-${ sprite.y + 15 }px`,
        width: '60px',
        height: '60px',
      },
    };
  }
  if (~sprite.name.indexOf('shirt'))
    sprite.custom.px.offset_y = `-${ sprite.y + 30 }px`; // even more for shirts
}

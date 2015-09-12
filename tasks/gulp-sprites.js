import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import spritesmith from 'gulp.spritesmith';
import clean from 'gulp-clean';
import sizeOf from 'image-size';
import merge from 'merge-stream';
import {sync} from 'glob';
import {times, each} from 'lodash';

const SPRITES_SRC = sync('common/img/sprites/spritesmith/**/*.png');
const DIST_PATH = 'common/dist/sprites/';

// https://github.com/Ensighten/grunt-spritesmith/issues/67#issuecomment-34786248
const MAX_SPRITESHEET_SIZE = 1024 * 1024 * 3;
const SPRITESHEET_SLICE_INDICIES = _calculateSpritesheetsSrcIndicies(SPRITES_SRC);

let spritesTasks = ['sprites:clean'];

each(SPRITESHEET_SLICE_INDICIES, (start, index) => {
  let slicedSrc = SPRITES_SRC.slice(start, SPRITESHEET_SLICE_INDICIES[index + 1]);
  let taskName = `sprites:${index}`;
  spritesTasks.push(taskName);

  gulp.task(taskName, () => {
    let spriteData = gulp.src(slicedSrc)
      .pipe(spritesmith({
        imgName: `spritesmith${index}.png`,
        cssName: `spritesmith${index}.css`,
        algorithm: 'binary-tree',
        padding: 1,
        cssTemplate: 'common/css/css.template.mustache',
        cssVarMap: _cssVarMap
      }));

    let imgStream = spriteData.img
      .pipe(imagemin())
      .pipe(gulp.dest(DIST_PATH));

    let cssStream = spriteData.css
      .pipe(gulp.dest(DIST_PATH));

    return merge(imgStream, cssStream);
  });
});

gulp.task('sprites:largeFiles', () => {

});

gulp.task('sprites:clean', (done) => {
  gulp.src(`${DIST_PATH}spritesmith*`)
    .pipe(clean());

  done();
});

gulp.task('sprites:checkCompiledDimensions', () => {
  console.log('Verifiying that images do not exceed max dimensions');

  let numberOfSheetsThatAreTooBig = 0;

  let distSpritesheets = sync(`${DIST_PATH}spritesmith*.png`);

  each(distSpritesheets, (img, index) => {
    let spriteSize = _calculateImgDimensions(img);

    if (spriteSize > MAX_SPRITESHEET_SIZE) {
      let name = `spritesmith${index}.png`;
      numberOfSheetsThatAreTooBig++;
      console.error(`WARNING: ${name} is too big - ${spriteSize} > ${MAX_SPRITESHEET_SIZE}`);
    }
  });

  if (numberOfSheetsThatAreTooBig > 0) {
    console.error(`${numberOfSheetsThatAreTooBig} sheets are too big :(`);
    console.error('Mobile Safari may be unhappy with you');
  } else {
    console.log('All images are within the correct dimensions');
  }
});

gulp.task('sprites:compile', spritesTasks, () => {
  gulp.run('sprites:checkCompiledDimensions');
});

function _calculateSpritesheetsSrcIndicies(src) {
  let totalPixels = 0;
  let slices = [0];

  each(src, (img, index) => {
    let imageSize = _calculateImgDimensions(img, true);
    totalPixels += imageSize;

    if (totalPixels > MAX_SPRITESHEET_SIZE) {
      slices.push(index - 1);
      totalPixels = imageSize;
    }
  });

  return slices;
}

function _calculateImgDimensions(img, addPadding) {
  let dims = sizeOf(img);

  let requiresSpecialTreatment = _checkForSpecialTreatment(img);
  if (requiresSpecialTreatment) {
    let newWidth = dims.width < 90 ? 90 : dims.width;
    let newHeight = dims.height < 90 ? 90 : dims.height;
    dims = {
      width: newWidth,
      height: newHeight
    };
  }

  let padding = 0;

  if (addPadding) {
    padding = (dims.width * 8) + (dims.height * 8);
  }

  if(!dims.width || !dims.height) console.error('MISSING DIMENSIONS:', dims);

  let totalPixelSize = (dims.width * dims.height) + padding;

  return totalPixelSize;
}

function _checkForSpecialTreatment(name) {
  let regex = /hair|skin|beard|mustach|shirt|flower|^headAccessory_special_\w+Ears/;
  return name.match(regex) || name === 'head_0';
}

function _cssVarMap(sprite) {
  // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class, which works as a
  // 60x60 image pointing at the proper part of the 90x90 sprite.
  // We set up the custom info here, and the template makes use of it.
  let requiresSpecialTreatment = _checkForSpecialTreatment(sprite.name);
  if (requiresSpecialTreatment) {
    sprite.custom = {
      px: {
        offset_x: `-${ sprite.x + 25 }px`,
        offset_y: `-${ sprite.y + 15 }px`,
        width: '60px',
        height: '60px'
      }
    }
  }
  if (~sprite.name.indexOf('shirt'))
    sprite.custom.px.offset_y = `-${ sprite.y + 30 }px`; // even more for shirts
}

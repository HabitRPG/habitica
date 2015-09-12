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
const SPRITESHEET_COUNT = _calculateNumberOfSpritesheets();
const NUMBER_OF_SPRITES_PER_SHEET = SPRITES_SRC.length / SPRITESHEET_COUNT;

let spritesTasks = ['sprites:clean'];

times(SPRITESHEET_COUNT, (i) => {
  let slicedSrc = _getSliceSrc(i);

  let taskName = `sprites:${i}`;
  spritesTasks.push(taskName);

  gulp.task(taskName, () => {
    let spriteData = gulp.src(slicedSrc)
      .pipe(spritesmith({
        imgName: `spritesmith${i}.png`,
        cssName: `spritesmith${i}.css`,
        algorithm: 'binary-tree',
        padding:1,
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
  }
});

gulp.task('sprites:compile', spritesTasks, () => {
  gulp.run('sprites:checkCompiledDimensions');
});

function _getSliceSrc(num) {
  let start = num * NUMBER_OF_SPRITES_PER_SHEET;
  let end = (num + 1) * NUMBER_OF_SPRITES_PER_SHEET;
  let src = SPRITES_SRC.slice(start, end)

  return src;
}

function _calculateNumberOfSpritesheets() {
  let totalPixels = 0;

  each(SPRITES_SRC, function(img){
    totalPixels += _calculateImgDimensions(img);
  });

  let numberOfSpriteSheets = Math.ceil(totalPixels / MAX_SPRITESHEET_SIZE);

  return numberOfSpriteSheets;
}

function _calculateImgDimensions(img) {
  let dims = sizeOf(img);

  if(!dims.width || !dims.height) console.error('MISSING DIMENSIONS:', dims);

  let totalPixelSize = dims.width * dims.height;

  return totalPixelSize;
}

function _cssVarMap(sprite) {
  // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class, which works as a
  // 60x60 image pointing at the proper part of the 90x90 sprite.
  // We set up the custom info here, and the template makes use of it.
  if (sprite.name.match(/hair|skin|beard|mustach|shirt|flower|^headAccessory_special_\w+Ears/) || sprite.name=='head_0') {
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

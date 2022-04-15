import gulp from 'gulp';
import spritesmith from 'gulp.spritesmith';
import clean from 'rimraf';
import mergeStream from 'merge-stream';
import { sync } from 'glob';

const IMG_DIST_PATH = 'website/client/src/assets/images/sprites/';
const CSS_DIST_PATH = 'website/client/src/assets/css/sprites/';

function checkForSpecialTreatment (name) {
  const regex = /^hair|skin|beard|mustach|shirt|flower|^headAccessory_special_\w+Ears|^eyewear_special_\w+TopFrame|^eyewear_special_\w+HalfMoon/;
  return name.match(regex) || name === 'head_0';
}

function cssVarMap (sprite) {
  // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class,
  // which works as a 60x60 image pointing at the proper part of the 90x90 sprite.
  // We set up the custom info here, and the template makes use of it.
  const requiresSpecialTreatment = checkForSpecialTreatment(sprite.name);
  if (requiresSpecialTreatment) {
    sprite.custom = {
      px: {
        offsetX: '-25px',
        offsetY: '-15px',
        width: '60px',
        height: '60px',
      },
    };
  }

  // even more for shirts
  if (sprite.name.indexOf('shirt') !== -1) {
    sprite.custom.px.offsetX = '-29px';
    sprite.custom.px.offsetY = '-42px';
  }

  if (sprite.name.indexOf('hair_base') !== -1) {
    const styleArray = sprite.name.split('_').slice(2, 3);
    if (Number(styleArray[0]) > 14) {
      sprite.custom.px.offsetY = '0'; // don't crop updos
    }
  }
}

function createSpritesStream (name, src) {
  const stream = mergeStream();

  const spriteData = gulp.src(src)
    .pipe(spritesmith({
      imgName: `spritesmith-${name}.png`,
      cssName: `spritesmith-${name}.css`,
      algorithm: 'binary-tree',
      padding: 1,
      cssTemplate: 'website/raw_sprites/css/css.template.handlebars',
      cssVarMap,
    }));

  const cssStream = spriteData.css
    .pipe(gulp.dest(CSS_DIST_PATH));

  stream.add(cssStream);

  return stream;
}

gulp.task('sprites:main', () => {
  const mainSrc = sync('habitica-images/**/*.png');
  return createSpritesStream('main', mainSrc);
});

gulp.task('sprites:clean', done => {
  clean(`${IMG_DIST_PATH}spritesmith*,${CSS_DIST_PATH}spritesmith*}`, done);
});

gulp.task('sprites:compile', gulp.series('sprites:clean', 'sprites:main', done => done()));

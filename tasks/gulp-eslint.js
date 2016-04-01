import gulp from 'gulp';
import eslint from 'gulp-eslint';

const SERVER_FILES = [
  './website/src/**/api-v3/**/*.js',
  './website/src/models/user.js',
  './website/src/models/task.js',
  './website/src/models/group.js',
  './website/src/models/challenge.js',
  './website/src/models/tag.js',
  './website/src/models/emailUnsubscription.js',
  './website/src/server.js',
];
const COMMON_FILES = [
  './common/script/**/*.js',
  // @TODO remove these negations as the files are converted over.
  '!./common/script/content/index.js',
  '!./common/script/ops/addPushDevice.js',
  '!./common/script/ops/addTag.js',
  '!./common/script/ops/addTask.js',
  '!./common/script/ops/addWebhook.js',
  '!./common/script/ops/blockUser.js',
  '!./common/script/ops/clearCompleted.js',
  '!./common/script/ops/clearPMs.js',
  '!./common/script/ops/deletePM.js',
  '!./common/script/ops/deleteTag.js',
  '!./common/script/ops/deleteTask.js',
  '!./common/script/ops/deleteWebhook.js',
  '!./common/script/ops/getTag.js',
  '!./common/script/ops/getTags.js',
  '!./common/script/ops/hourglassPurchase.js',
  '!./common/script/ops/purchase.js',
  '!./common/script/ops/readCard.js',
  '!./common/script/ops/rebirth.js',
  '!./common/script/ops/releaseBoth.js',
  '!./common/script/ops/releaseMounts.js',
  '!./common/script/ops/releasePets.js',
  '!./common/script/ops/reroll.js',
  '!./common/script/ops/reset.js',
  '!./common/script/ops/revive.js',
  '!./common/script/ops/sell.js',
  '!./common/script/ops/sortTag.js',
  '!./common/script/ops/sortTask.js',
  '!./common/script/ops/unlock.js',
  '!./common/script/ops/update.js',
  '!./common/script/ops/updateTag.js',
  '!./common/script/ops/updateTask.js',
  '!./common/script/ops/updateWebhook.js',
  '!./common/script/fns/crit.js',
  '!./common/script/fns/cron.js',
  '!./common/script/fns/dotGet.js',
  '!./common/script/fns/dotSet.js',
  '!./common/script/fns/getItem.js',
  '!./common/script/fns/nullify.js',
  '!./common/script/fns/preenUserHistory.js',
  '!./common/script/fns/randomDrop.js',
  '!./common/script/fns/updateStats.js',
  '!./common/script/libs/appliedTags.js',
  '!./common/script/libs/countExists.js',
  '!./common/script/libs/dotGet.js',
  '!./common/script/libs/dotSet.js',
  '!./common/script/libs/encodeiCalLink.js',
  '!./common/script/libs/friendlyTimestamp.js',
  '!./common/script/libs/gold.js',
  '!./common/script/libs/newChatMessages.js',
  '!./common/script/libs/noTags.js',
  '!./common/script/libs/percent.js',
  '!./common/script/libs/planGemLimits.js',
  '!./common/script/libs/preenHistory.js',
  '!./common/script/libs/preenTodos.js',
  '!./common/script/libs/removeWhitespace.js',
  '!./common/script/libs/silver.js',
  '!./common/script/libs/splitWhitespace.js',
  '!./common/script/libs/taskClasses.js',
  '!./common/script/libs/taskDefaults.js',
  '!./common/script/libs/uuid.js',
  '!./common/script/public/**/*.js',
];
const TEST_FILES = [
  './test/**/*.js',
  // @TODO remove these negations as the test files are cleaned up.
  '!./test/api-legacy/**/*',
  '!./test/common_old/simulations/**/*',
  '!./test/content/**/*',
  '!./test/server_side/**/*',
  '!./test/spec/**/*',
];

let linter = (src, options) => {
  return gulp
    .src(src)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

// TODO lint client
// TDOO separate linting cong between
// TODO lint gulp tasks, tests, ...?
// TODO what about prefer-const rule?
// TODO remove estraverse dependency once https://github.com/adametry/gulp-eslint/issues/117 sorted out
gulp.task('lint:server', () => {
  return linter(SERVER_FILES);
});

gulp.task('lint:common', () => {
  return linter(COMMON_FILES);
});

gulp.task('lint:tests', () => {
  return linter(TEST_FILES);
});

gulp.task('lint', ['lint:server', 'lint:common', 'lint:tests']);

gulp.task('lint:watch', () => {
  gulp.watch([
    SERVER_FILES,
    COMMON_FILES,
    TEST_FILES,
  ], ['lint']);
});

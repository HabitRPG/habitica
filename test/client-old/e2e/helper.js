import fs from 'fs';
import { resetHabiticaDB } from '../../helpers/mongo';

before(async () => {
  await resetHabiticaDB();
});

// based on https://github.com/angular/protractor/issues/114#issuecomment-29046939
afterEach(async function () {
  let lastTest = this.currentTest;

  if (lastTest.state === 'failed') {
    let filename = `exception_${lastTest.title}.png`;
    let png = await browser.takeScreenshot();
    let buffer = new Buffer(png, 'base64');
    let stream = fs.createWriteStream(filename);

    stream.write(buffer);
    stream.end();
  }
});


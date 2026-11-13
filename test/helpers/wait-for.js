export async function waitFor (check, { timeout = 2000, interval = 10 } = {}) { // eslint-disable-line import/prefer-default-export, max-len
  const deadline = Date.now() + timeout;

  for (;;) {
    try {
      return await check(); // eslint-disable-line no-await-in-loop
    } catch (err) {
      if (Date.now() >= deadline) throw err;
    }
    await new Promise(resolve => { setTimeout(resolve, interval); }); // eslint-disable-line no-await-in-loop, max-len
  }
}

export async function sleep (seconds = 1) {
  let milliseconds = seconds * 1000;

  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

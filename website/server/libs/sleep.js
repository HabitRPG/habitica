export default async function (seconds = 1) {
  const milliseconds = seconds * 1000;

  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

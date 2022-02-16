export const log = (
  message: string
) => {
  const timestamp = new Date().toLocaleString();
  console.log(`${timestamp}: ${message}`);
};
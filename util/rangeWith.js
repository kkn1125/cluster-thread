export default (range) => {
  const isPlus = Boolean(Math.floor(Math.random() * 2));
  const random = Math.floor(Math.random() * range * 100) / 100;
  const randomNumber = isPlus ? random : -random;

  return +randomNumber.toFixed(2);
};

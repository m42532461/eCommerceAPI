module.exports = generateCode = () => {
  const getRandom = (arr) => {
    let random = Math.floor(Math.random() * arr.length);
    return arr[random];
  };
  const number = "0123456789".split("");
  let password = "";
  for (i = 0; i < 6; i++) {
    password += getRandom(number);
  }
  return password;
};

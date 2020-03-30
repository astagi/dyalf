let calculateChk = (buff) => {
  let ret = 0x00;
  for (let i = 0; i < buff.length; i++) {
    ret += buff[i];
  }
  ret = ret & 255;
  return (ret ^ 255);
}

module.exports = {
  calculateChk: calculateChk
};

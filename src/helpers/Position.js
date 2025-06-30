export default {
  colors() {
    return [
      ["#ffc107", "white"] /* 1º */,
      ["#6c757d", "white"] /* 2º */,
      ["#dc3545", "white"] /* 3º */,
      ["#0dcaf0", "white"] /* 4º */,
      ["#198754", "white"] /* 5º */,
      /***************************/
      ["#000000", "white"] /* Xº */,
      ["#595858", "white"] /* Yº */,
    ];
  },
  color(number) {
    let colors = this.colors();
    if (number > colors.length) {
      if (number % 2 === 0) {
        return colors[colors.length - 2];
      } else {
        return colors[colors.length - 1];
      }
    } else {
      return colors[number - 1];
    }
  },
};

export default {
  colors() {
    return [
      ["#ffc107", "white"],
      ["#6c757d", "white"],
      ["#dc3545", "white"],
      ["#000000", "white"],
    ];
  },
  color(number) {
    let colors = this.colors();
    if (number > colors.length) {
      return colors[colors.length - 1];
    } else {
      return colors[number - 1];
    }
  },
};

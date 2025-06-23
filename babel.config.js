module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    // Remove consoles em produção
    process.env.NODE_ENV === "production" ? "transform-remove-console" : "",
  ],
};

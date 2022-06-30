// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  globals: {
    'MathJax': true,
    '_czc': true
  },
  extends: [
    'plugin:mew/vue'
  ],
}
const randomString = require("randomstring");

module.exports = () => {
  return randomString.generate({
    length: 16,
    charset: "alphanumeric",
  });
};
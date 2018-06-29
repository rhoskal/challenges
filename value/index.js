module.exports = function value(obj) {
  if (typeof obj !== 'function') {
    return obj
  } else {
    return value(obj());
  }
};

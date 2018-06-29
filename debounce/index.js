module.exports = function debounce(fn, delay) {
  var timeout;

  return function() {
    var context = this;
    var args = arguments;

    clearTimeout(timeout);
    // must use 'apply' instead of 'call' b/c test case 5 passes array
    timeout = setTimeout(() => fn.apply(context, args), delay);
  }
};

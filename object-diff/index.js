module.exports = function diff(n, o) {
  let objectDiff = [];

  for (let key in o) {
    if (!(key in n)) {
      objectDiff.push(['-', key, o[key]]);
    }
  }

  for (let key in n) {
    if (!(key in o)) {
      objectDiff.push(['+', key, n[key]]);
    }
  }

  return objectDiff;
};

// * note: this won't work on nested objects but since the test cases were set to skip I assumed you just wanted a shallow comparison 

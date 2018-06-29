module.exports = function throttlePromises(limit, factories) {
  let i = 0;
  let resultArray = new Array(factories.length);

  function doNextAsync() {
    if (i < factories.length) {
      let factoryIndex = i++;
      let nextAsync = factories[factoryIndex];

      return Promise.resolve(nextAsync())
          .then(result => {
             resultArray[factoryIndex] = result;
             return;
          })
          .then(doNextAsync);
    }
  }

  let listOfPromises = [];
  while (i < limit && i < factories.length) {
    listOfPromises.push(doNextAsync());
  }

  return Promise.all(listOfPromises).then(() => resultArray);
};

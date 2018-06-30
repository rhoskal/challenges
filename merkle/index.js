const assert = require('assert');

module.exports = class Merkle {
  constructor(data, hasher) {
    assert(typeof hasher === 'function', 'A Merkle tree requires a hashing function.');
    assert(data instanceof Array, 'A Merkle tree requires an array of values.');

    this.hashingFn = hasher;
    this.levels = [data].concat(this._buildTree(data));
  }

  _buildTree (data) {
    let level = [];

    for (let i = 0; i < data.length; i += 2) {
      const left = data[i];
      const right = (i + 1 === data.length) ? left : data[i + 1];

      // node = left + right
      level.push(this.hashingFn(left + right));
    }

    if (level.length > 1) {
      // keep deriving
      return [level].concat(this._buildTree(level));
    } else {
      // found root node
      return [level];
    }
  }

  _findPairs(index) {
    let nodes = []

    for (let i = 0; i < this.levels.length; i++) {
      let level = this.levels[i];
      let width = level.length;

      if (!(index === width - 1 && width % 2 === 1)) {
        const left = (index % 2) ? level[index - 1] : level[index];
        const right = (index % 2) ? level[index] : level[index + 1];
        nodes.push([left, right]);
      }

      index = Math.floor(index / 2);
    }

    return nodes;
  }

  getVerification(str) {
    const index = this.levels[0].indexOf(str);

    if (index === -1) {
      return false;
    } else {
      const nodes = this._findPairs(index);
      const breadcrumbs = [];

      // fill in leaf node
      breadcrumbs.push(nodes[0][0] === str ? nodes[0][1] : nodes[0][0]);
      let tempHash = this.hashingFn(nodes[0][0] + nodes[0][1]);
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i][0] === tempHash) {
          breadcrumbs.push(nodes[i][1]);
        } else {
          breadcrumbs.push(nodes[i][0]);
        }

        tempHash = this.hashingFn(nodes[i][0] + nodes[i][1]);
      }

      return {
        index: index,
        breadcrumbs: breadcrumbs
      };
    }
  }

  verify(str, root, obj, hasher) {
    let finalHash = obj.index % 2 === 0 ? hasher(str + obj.breadcrumbs[0]) : hasher(obj.breadcrumbs[0] + str);

    for (let i = 1; i < obj.breadcrumbs.length; i++) {
      finalHash = hasher(finalHash + obj.breadcrumbs[i]);
    }

    return finalHash === this.root;

  }

  get root() {
    return this.levels[this.levels.length - 1][0];
  }
}

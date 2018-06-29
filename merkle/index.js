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

  getVerification(str) {
    const index = this.levels[0].indexOf(str);

    if (index === -1) {
      return false;
    } else {
      const breadcrumbs = [];
      breadcrumbs.push(index % 2 === 0 ? this.levels[0][index + 1] : this.levels[0][index - 1]);

      let pos = Math.round(index / 2);
      let level = 1;
      while (level < this.levels.length - 1) {
        breadcrumbs.push(pos % 2 === 0 ? this.levels[level][pos + 1] : this.levels[level][pos - 1]);
        pos = Math.trunc(pos / 2);
        level++;
      }

      return {
        index: index,
        breadcrumbs: breadcrumbs
      };
    }
  }

  verify(str, root, obj, hasher) {
    let finalHash = hasher(str + obj.breadcrumbs[0]);
    // let finalHash = obj.index % 2 === 0 ? hasher(str + obj.breadcrumbs[0]) : hasher(obj.breadcrumbs[0] + str);
    // let pos = Math.round(obj.index / 2);
    let level = 1;
    while(level < this.levels.length - 1) {
      console.log(finalHash);
      if (finalHash === this.root) {
        return true;
      }

      finalHash = hasher(finalHash + obj.breadcrumbs[level]);
      // pos = Math.trunc(pos / 2);
      level++;
    }

    return false;
  }

  get root() {
    return this.levels[this.levels.length - 1][0];
  }
}

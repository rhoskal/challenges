const assert = require('assert');
const crypto = require('crypto');

module.exports = class MerkleTree {
  constructor(data) {
    assert(data instanceof Array, 'A Merkle tree requires an array of values.');

    this.levels = [data].concat(this._buildTree(data));
  }

  _buildTree (data) {
    let level = [];

    for (let i = 0; i < data.length; i += 2) {
      const left = data[i];
      const right = (i + 1 === data.length) ? left : data[i + 1];

      level.push(this._doublesha256(left + right));
    }

    if (level.length > 1) {
      return [level].concat(this._buildTree(level));
    } else {
      return [level];
    }
  }

  _findPairs(index) {
    let nodes = []

    for (let i = 0; i < this.levels.length - 1; i++) {
      let level = this.levels[i];
      let width = level.length;

      if (!(index === width - 1 && width % 2 === 1)) {
        const left = index % 2 === 0 ? level[index] : level[index - 1];
        const right = index % 2 === 0 ? level[index + 1] : level[index];
        nodes.push([left, right]);
      } else {
        nodes.push([level[index], level[index]]);
      }

      index = Math.floor(index / 2);
    }

    return nodes;
  }

  getVerification(str, proof = []) {
    const idx = this.levels[0].indexOf(str);

    if (idx === -1) {
      return false;
    } else {
      const nodes = this._findPairs(idx);

      // fill in leaf node
      proof.push(nodes[0][0] === str ? [1, nodes[0][1]] : [0, nodes[0][0]]);

      let tempHash = this._doublesha256(nodes[0][0] + nodes[0][1]);
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i][0] === tempHash) {
          proof.push([1, nodes[i][1]]);
        } else {
          proof.push([0, nodes[i][0]]);
        }

        tempHash = this._doublesha256(nodes[i][0] + nodes[i][1]);
      }

      return {
        index: idx,
        breadcrumbs: proof
      };
    }
  }

  _doublesha256(str) {
    return this._sha256(this._sha256(str));
  }

  _sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  verify(str, root, obj) {
    let finalHash =
      obj.breadcrumbs[0][0] === 0 ?
        this._doublesha256(obj.breadcrumbs[0][1] + str) :
        this._doublesha256(str + obj.breadcrumbs[0][1]);

    for (let i = 1; i < obj.breadcrumbs.length; i++) {
      finalHash =
        obj.breadcrumbs[i][0] === 0 ?
          this._doublesha256(obj.breadcrumbs[i][1] + finalHash) :
          this._doublesha256(finalHash + obj.breadcrumbs[i][1]);
    }

    return finalHash === this.root;
  }

  get root() {
    return this.levels[this.levels.length - 1][0];
  }
}

const assert = require('assert');
const crypto = require('crypto');

const MerkleTree = require('./');

describe('MerkleTree', function() {
  describe('has a root property correctly set when', function() {
    it('has a power of two elements', function() {
      var tree = new MerkleTree(['This', 'is', 'a', 'test']);
      var verificationObject = tree.getVerification('test');

      assert.equal(
        tree.root,
        '03ec2401c15c2c6dbbf7d5598d38513dfcd4191deb1befded253ee9fffd75d9c',
        'hashes do not match'
      );
    });

    it('has a power of two elements with dupes', function() {
      var tree = new MerkleTree(['This', 'is', 'cool', 'cool']);

      assert.equal(
        tree.root,
        'd8e1c955b3856f337f4d5741acbd5baf8ba89f18c9255e55a8ba23491083d17b',
        'hashes do not match'
      );
    });

    it('has a an odd number of elements', function() {
      var tree = new MerkleTree(['This', 'is', 'cool']);

      assert.equal(
        tree.root,
        'd8e1c955b3856f337f4d5741acbd5baf8ba89f18c9255e55a8ba23491083d17b',
        'hashes do not match'
      );
    });

    it('has a large number of elements', function() {
      var arr = 'here is a test to see if we can find all the cool words in this list'.split(' ');
      var tree = new MerkleTree(arr);

      assert.equal(
        tree.root,
        'fae30b4e4aabed1c20e88eafa2ebc14fc766f107ec1306b63098a05f9c6c65b4',
        'hashes do not match'
      );
    });
  });

  describe('can verify an element is in a tree when', function() {
    it('has a power of two elements', function() {
      var tree = new MerkleTree(['This', 'is', 'a', 'test']);
      var obj = tree.getVerification('is');

      assert(tree.verify('is', tree.root, obj));
    });

    it('has a power of two elements with dupes', function() {
      var tree = new MerkleTree(['This', 'is', 'cool', 'cool']);
      var obj = tree.getVerification('cool');

      assert(tree.verify('cool', tree.root, obj));
    });

    it('has a an odd number of elements', function() {
      var tree = new MerkleTree(['This', 'is', 'cool']);
      var obj = tree.getVerification('cool');

      assert(tree.verify('cool', tree.root, obj));
    });

    it('has a large number of elements', function() {
      var arr = 'here is a test to see if we can find all the cool words in this list'.split(' ');
      var tree = new MerkleTree(arr);
      var obj = tree.getVerification('cool');

      assert(tree.verify('cool', tree.root, obj));
    });
  });

  it('works just like bitcoin!', function() {
    function doublesha256(str) {
      return sha256(sha256(str));
    }

    function sha256(str) {
      return crypto.createHash('sha256').update(str).digest('hex');
    }

    var seeder = doublesha256('some seed', 2);
    var values = [];
    for (var i = 0; i < 10000; i++) {
      values.push('value' + i + ' ' + doublesha256(seeder + i, 2));
    }

    var tree = new MerkleTree(values);
    var lookFor = values[4567];
    var obj = tree.getVerification(lookFor);

    assert.equal(
      tree.root,
      'e213bb72c8975346d44abc5bfc917ef2e28ef8277007e9c3346f238c6a0d68d1',
      'hashes do not match'
    );

    assert(tree.verify(lookFor, tree.root, obj));
  });
});

# Object Diffing

Given JavaScript objects like this

```javascript
newCode = {
  apples: 3,
  oranges: 4
}

oldCode = {
  apples: 3,
  grapes: 5
}
```

Create a function that returns an array containing the object diff like this

```javascript
diff(newCode, oldCode)

// returns:
// [
//   ['-', 'grapes', 5],
//   ['+', 'oranges', 4]
// ]
```

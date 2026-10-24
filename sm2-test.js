const assert = require('assert');
const { sm2 } = require('./sm2');

let card = { streak: 0, interval: 0, easiness: 2.5 };

card = sm2(card, 4);
assert.strictEqual(card.interval, 1);
card = sm2(card, 4);
assert.strictEqual(card.interval, 6);
card = sm2(card, 4);
assert.strictEqual(card.interval, 15);

card = sm2(card, 2);
assert.strictEqual(card.streak, 0);
assert.strictEqual(card.interval, 1);

for (let i = 0; i < 30; i++) {
    card = sm2(card, 3);
}
assert.strictEqual(card.easiness, 1.3);

console.log('All tests passed!');
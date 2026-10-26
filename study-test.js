const assert = require("node:assert");
const { study } = require("./study.js");

// Test 1: "I don't know." -> streak resets, misses increment, returns 3 cards later
{
    const card = { id: 1, front: "f", back: "b", streak: 2, misses: 1 };
    const result = study(card, 1);
    assert.strictEqual(result.card.streak, 0);
    assert.strictEqual(result.card.misses, 2);
    assert.strictEqual(result.interval, 3);
}

// Test 2: "I struggled." -> streak resets, misses stay the same, returns 5 cards later
{
    const card = { id: 1, front: "f", back: "b", streak: 2, misses: 1 };
    const result = study(card, 2);
    assert.strictEqual(result.card.streak, 0);
    assert.strictEqual(result.card.misses, 1);
    assert.strictEqual(result.interval, 5);
}

// Test 3: "I got it!" -> streak increments, misses stay the same, returns 8 cards later
{
    const card = { id: 1, front: "f", back: "b", streak: 0, misses: 2 };
    const result = study(card, 3);
    assert.strictEqual(result.card.streak, 1);
    assert.strictEqual(result.card.misses, 2);
    assert.strictEqual(result.interval, 8);
}

// Test 4: Card mastery: third "I got it" in a row -> streak increments, misses decrement, remove card
{
    const card = { id: 1, front: "f", back: "b", streak: 2, misses: 3 };
    const result = study(card, 3);
    assert.strictEqual(result.card.streak, 3);
    assert.strictEqual(result.interval, null);
    assert.strictEqual(result.card.misses, 2);
}

// Test 5: Misses never go below 0
{
    const card = { id: 1, front: "f", back: "b", streak: 2, misses: 0 };
    const result = study(card, 3);
    assert.strictEqual(result.card.misses, 0);
}

console.log("All tests passed.");
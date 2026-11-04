const assert = require('assert');
const { normalizeNumbers } = require('../src/services/numberNormalizer');

console.log('===============================================================');
console.log('🧪 RUNNING NUMBER NORMALIZER TESTS');
console.log('===============================================================');

// Positive test 1: Hindi word to digits
const t1 = normalizeNumbers("I want to pay पाँच सौ rupees");
console.log(`▶ Hindi 'पाँच सौ': "${t1}"`);
assert.strictEqual(t1.includes("500"), true, "Should normalize 'पाँच सौ' to '500'");

// Positive test 2: English word to digits
const t2 = normalizeNumbers("transfer five hundred rupees to account");
console.log(`▶ English 'five hundred': "${t2}"`);
assert.strictEqual(t2.includes("500"), true, "Should normalize 'five hundred' to '500'");

// Positive test 3: Marathi 'पाचशे' to digits
const t3 = normalizeNumbers("मला पाचशे रुपये पाठवायचे आहेत");
console.log(`▶ Marathi 'पाचशे': "${t3}"`);
assert.strictEqual(t3.includes("500"), true, "Should normalize 'पाचशे' to '500'");

// Positive test 4: Multilevel number 'दो लाख' (2,00,000)
const t4 = normalizeNumbers("loan amount do lakh hai: दो लाख");
console.log(`▶ Hindi 'दो लाख': "${t4}"`);
assert.strictEqual(t4.includes("200000"), true, "Should normalize 'दो लाख' to '200000'");

// Positive test 5: Compound units 'twenty five'
const t5 = normalizeNumbers("room number twenty five");
console.log(`▶ English 'twenty five': "${t5}"`);
assert.strictEqual(t5.includes("25"), true, "Should normalize 'twenty five' to '25'");

// Negative test 1: "पाँच हज़ार" must NOT match 500 (must be 5000)
const t6 = normalizeNumbers("पाँच हज़ार");
console.log(`▶ Negative check 'पाँच हज़ार': "${t6}"`);
assert.strictEqual(t6, "5000", "'पाँच हज़ार' must normalize to 5000, NOT 500");
assert.notStrictEqual(t6, "500", "'पाँच हज़ार' must NOT equal 500");

// Negative test 2: "415" vs "450"
const t7 = normalizeNumbers("415");
assert.notStrictEqual(t7, "450", "'415' must NOT match '450'");

console.log('✅ ALL NUMBER NORMALIZER TESTS PASSED!');


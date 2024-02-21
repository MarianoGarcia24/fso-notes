const { test } = require('node:test')
const assert = require('node:assert')

const reverse = require('../utils/for_testing').reverse

test('reverse of a', () => {
    const result = reverse('a')

    assert.strictEqual(result,'a')
})

test('reverse of react', () => {
    const result = reverse('react')

    assert.strict(result,'tcaer')
})

test('reverse of releveler',() => {
    const result = reverse('releveler')

    assert.strict(result,'releveler')
})


const test = require('node:test');
const assert = require('node:assert/strict');

const { isNullOrBlank, isPlainObject, isThenable } = require('../lib/utils');
const { deepMergeLocale } = require('../lib/configProvider/mergeLocale');
const { zh_CN, en_US } = require('../lib/locales');
const { computeDragBounds } = require('../lib/hooks/useDragBounds');

test('utils: isNullOrBlank', () => {
  assert.equal(isNullOrBlank(null), true);
  assert.equal(isNullOrBlank(undefined), true);
  assert.equal(isNullOrBlank(''), true);
  assert.equal(isNullOrBlank('   '), true);
  assert.equal(isNullOrBlank('hello'), false);
  assert.equal(isNullOrBlank(0), false);
  assert.equal(isNullOrBlank(false), false);
});

test('utils: isPlainObject', () => {
  assert.equal(isPlainObject({}), true);
  assert.equal(isPlainObject({ a: 1 }), true);
  assert.equal(isPlainObject([]), false);
  assert.equal(isPlainObject(null), false);
  assert.equal(isPlainObject('str'), false);
});

test('utils: isThenable', () => {
  assert.equal(isThenable(Promise.resolve(1)), true);
  assert.equal(isThenable({ then: () => {} }), true);
  assert.equal(isThenable({}), false);
  assert.equal(isThenable(null), false);
});

test('locales: deepMergeLocale fallback and override', () => {
  const merged = deepMergeLocale(zh_CN.Modal, {
    minimize: '最小化自定义',
  });
  assert.equal(merged.minimize, '最小化自定义');
  assert.equal(merged.maximize, zh_CN.Modal.maximize);
  assert.equal(merged.close, zh_CN.Modal.close);
});

test('hooks: computeDragBounds in SSR environment returns zeroed bounds', () => {
  const dummyEl = {};
  const bounds = computeDragBounds(dummyEl, { x: 0, y: 0 });
  assert.deepEqual(bounds, { left: 0, top: 0, right: 0, bottom: 0 });
});

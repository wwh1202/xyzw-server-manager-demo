'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { inspectProtocolSample } = require('../src/core/protocol-inspector');
const { probeTcp } = require('../src/core/transport-probe');

test('protocol inspector redacts credential-like JSON fields', () => {
  const result = inspectProtocolSample(JSON.stringify({
    type: 'hello',
    token: 'secret-token-value',
    nested: { Cookie: 'secret-cookie-value', ok: true }
  }));
  assert.equal(result.format, 'json');
  assert.deepEqual(result.topLevelKeys, ['type', 'token', 'nested']);
  assert.doesNotMatch(result.preview, /secret-token-value|secret-cookie-value/);
  assert.match(result.preview, /REDACTED/);
});

test('protocol inspector redacts inline text credentials', () => {
  const result = inspectProtocolSample('token=abc123 authorization: Bearer-secret password="p@ss"');
  assert.doesNotMatch(result.preview, /abc123|Bearer-secret|p@ss/);
});

test('protocol inspector reports byte length and format for text', () => {
  const result = inspectProtocolSample('hello');
  assert.equal(result.format, 'text');
  assert.equal(result.byteLength, 5);
});

test('TCP probe rejects URL values and invalid ports without networking', async () => {
  await assert.rejects(() => probeTcp({ host: 'https://example.com', port: 443 }), /hostname or IP/);
  await assert.rejects(() => probeTcp({ host: 'example.com', port: 70000 }), /port must/);
});

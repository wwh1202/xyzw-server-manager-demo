'use strict';

const SENSITIVE_KEY = /(?:token|authorization|cookie|password|passwd|secret|session|credential|api[_-]?key)/i;
const INLINE_SECRET = /\b(token|authorization|cookie|password|passwd|secret|session|api[_-]?key)\b(\s*[:=]\s*)(["']?)[^\s,;"'}]+/gi;

function redactText(text) {
  return String(text).replace(INLINE_SECRET, (_match, key, separator, quote) => `${key}${separator}${quote}[REDACTED]`);
}

function redactValue(value) {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactValue(child);
    }
    return output;
  }
  if (typeof value === 'string') return redactText(value);
  return value;
}

function inspectProtocolSample(input) {
  const raw = Buffer.isBuffer(input) ? input.toString('utf8') : String(input ?? '');
  let parsed;
  let format = 'text';
  try {
    parsed = JSON.parse(raw);
    format = 'json';
  } catch {
    parsed = undefined;
  }

  const safe = parsed === undefined ? redactText(raw) : redactValue(parsed);
  const preview = typeof safe === 'string' ? safe : JSON.stringify(safe, null, 2);
  const topLevelKeys = safe && typeof safe === 'object' && !Array.isArray(safe)
    ? Object.keys(safe)
    : [];

  return {
    format,
    byteLength: Buffer.byteLength(raw, 'utf8'),
    topLevelKeys,
    preview: preview.slice(0, 4000),
    truncated: preview.length > 4000
  };
}

module.exports = { inspectProtocolSample, redactText, redactValue };

'use strict';

const dns = require('node:dns').promises;
const net = require('node:net');

async function probeTcp({ host, port, timeoutMs = 4000 }) {
  if (typeof host !== 'string' || !host.trim() || /[\s/\\]/.test(host)) {
    throw new TypeError('host must be a hostname or IP address, not a URL');
  }
  const numericPort = Number(port);
  if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
    throw new TypeError('port must be an integer from 1 to 65535');
  }

  const startedAt = Date.now();
  let addresses;
  try {
    addresses = await dns.lookup(host.trim(), { all: true });
  } catch (error) {
    return {
      ok: false,
      stage: 'dns',
      host: host.trim(),
      port: numericPort,
      elapsedMs: Date.now() - startedAt,
      error: error.code || error.message
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    const socket = net.createConnection({ host: host.trim(), port: numericPort });
    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({
        host: host.trim(),
        port: numericPort,
        addresses: addresses.map((entry) => entry.address),
        elapsedMs: Date.now() - startedAt,
        ...result
      });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish({
      ok: true,
      stage: 'tcp',
      message: 'TCP handshake succeeded; application protocol and authentication are not verified.'
    }));
    socket.once('timeout', () => finish({
      ok: false,
      stage: 'tcp',
      error: 'TIMEOUT'
    }));
    socket.once('error', (error) => finish({
      ok: false,
      stage: 'tcp',
      error: error.code || error.message
    }));
  });
}

module.exports = { probeTcp };

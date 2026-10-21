'use strict';

const { inspectProtocolSample } = require('./core/protocol-inspector');
const { probeTcp } = require('./core/transport-probe');

function parseFlags(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
    result[key.slice(2)] = value;
    i += 1;
  }
  return result;
}

function printDoctor() {
  const platform = process.env.XYZW_PLATFORM || 'unset';
  const supported = ['wechat-mini-program', 'android-app'];
  const report = {
    node: process.version,
    platform,
    recognizedPlatform: supported.includes(platform),
    adapter: 'not-implemented',
    gameConnection: 'not-tested',
    nextSteps: [
      'Confirm the game client version and the exact failure stage.',
      'Use only a verified host and port for an optional TCP probe.',
      'Provide a redacted response/sample before implementing a protocol adapter.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
  return report.recognizedPlatform ? 0 : 2;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main(argv) {
  const [command, ...args] = argv;
  if (!command || command === 'help' || command === '--help') {
    console.log('Usage: npm start -- <doctor|probe --host HOST --port PORT|inspect-protocol>');
    return 0;
  }

  if (command === 'doctor') return printDoctor();

  if (command === 'probe') {
    const flags = parseFlags(args);
    if (!flags.host || !flags.port) throw new Error('Usage: probe --host HOST --port PORT');
    const result = await probeTcp({ host: flags.host, port: flags.port });
    console.log(JSON.stringify(result, null, 2));
    return result.ok ? 0 : 1;
  }

  if (command === 'inspect-protocol') {
    const sample = await readStdin();
    if (!sample.trim()) throw new Error('Provide a redacted sample through stdin.');
    console.log(JSON.stringify(inspectProtocolSample(sample), null, 2));
    return 0;
  }

  throw new Error(`Unknown command: ${command}`);
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 2;
});

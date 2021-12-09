const { Readable } = require('stream');
const { ServiceBroker } = require('moleculer');

const mainBroker = new ServiceBroker({
  logger: console,
  logLevel: 'debug',
  nodeID: 'main',
  transporter: 'redis://localhost:6379',
});

const brokerWithWorker = new ServiceBroker({
  logger: console,
  logLevel: 'debug',
  nodeID: 'with-worker',
  transporter: 'redis://localhost:6379',
});

brokerWithWorker.createService({
  name: 'worker',
  actions: {
    async getBigMessage() {
      const buff = Buffer.alloc(60 * 1024 * 1024);
      return Readable.from(buff);
    },
  },
});

brokerWithWorker.start().then(async () => {
  await mainBroker.start();

  const stream = await mainBroker.call('worker.getBigMessage');
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const result = Buffer.concat(chunks);
  mainBroker.logger.info(`${result.byteLength} bytes received successfully`);
});

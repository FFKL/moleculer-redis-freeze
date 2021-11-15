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
      return Buffer.alloc(60 * 1024 * 1024);
    },
  },
});

brokerWithWorker.start().then(async () => {
  await mainBroker.start();
  await mainBroker
    .call('worker.getBigMessage')
    // will wait forever!
    .then((res) => mainBroker.logger.info(`Size: ${res.data.length}`))
    .catch((err) => mainBroker.logger.error(`Error: ${err}`));
});

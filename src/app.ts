import { connect } from 'amqplib';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cookQueue = 'cook_queue';
const cookRecoveryQueue = 'cook_queue_recovery';
let i = 0;
const id = Math.random().toFixed(6).slice(2);

const cookQueueOptions = {
  queue: cookQueue,
  options: {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: cookRecoveryQueue,
  },
};
const cookRecoveryQueueOptions = {
  queue: cookRecoveryQueue,
  options: {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: cookQueue,
    messageTtl: 5000,
  },
};

async function qc() {
  try {
    const connection = await connect('amqp://127.0.0.1:5672');
    // const connection = await connect({/},);
    const channel = await connection.createChannel();

    process.once('SIGINT', () => {
      void channel.close().then(() => {
        void connection.close();
        return;
      });
    });

    await channel.assertQueue(cookQueueOptions.queue, cookQueueOptions.options);
    await channel.assertQueue(cookRecoveryQueueOptions.queue, cookRecoveryQueueOptions.options);

    await channel.consume(
      cookQueueOptions.queue,
      (message) => {
        console.log(` [x] Received ${String(message?.content.toString())}`);
        console.log('nack');
        if (message !== null) channel.nack(message, false, false);
      },
      { noAck: false },
    );
  } catch (error) {
    console.warn(error);
  }
}

async function qs() {
  try {
    const connection = await connect('amqp://127.0.0.1:5672');
    const channel = await connection.createChannel();

    process.once('SIGINT', () => {
      void channel.close().then(() => {
        void connection.close();
        return;
      });
    });

    await channel.assertQueue(cookQueueOptions.queue, cookQueueOptions.options);

    // channel.sendToQueue(cookQueueOptions.queue, Buffer.from(`Hi - ${String(i)} | ${id}`), {
    //   persistent: true,
    // });
    // console.log(` [x] Sent | Hi - ${String(i)} | ${id}`);
    i += 1;
    await channel.close();
  } catch (error) {
    console.warn(error);
  }
}

async function init() {
  await qc();

  for (let x = 0; x < 3; x += 1) {
    await sleep(3000);
    await qs();
  }
}

void init();

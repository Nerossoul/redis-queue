import {createClient} from "redis";
import * as os from 'os';

import {STREAM_NAME, CONSUMER_GROUP, WorkerTypes, rangeMax} from "./config.js";
import {runWorkerProcess} from "./utils/runWorkerProcess.js";

const client = createClient();

await client.connect();

try {
    await client.xGroupCreate(STREAM_NAME, CONSUMER_GROUP, '0', {
        MKSTREAM: true
    });
} catch (err) {
}

client.disconnect()

const systemCpuCores = os.cpus();

const currentWorkers = []

const addWorker = (worker) => currentWorkers.push(worker)

async function runConsumer() {

    const sharedArrayBuffer = new SharedArrayBuffer(BigUint64Array.BYTES_PER_ELEMENT * rangeMax);

    const sharedArray = new BigUint64Array(sharedArrayBuffer)

    const workersPromises =
        Array.from(Array(systemCpuCores.length).keys()).map(
            (_, index) => runWorkerProcess(
                './consumer-worker.js',
                {
                    streamName: STREAM_NAME,
                    groupName: CONSUMER_GROUP,
                    workerNumber: index + 1,
                    sharedArray
                },
                WorkerTypes.consumer,
                addWorker))
    await Promise.race(workersPromises)
    stopConsumerWorkers()

    return sharedArray
}

function stopConsumerWorkers() {
    currentWorkers.forEach(async worker => {
        const workerThreadId = worker.threadId
        await worker.terminate()
        // console.log(`${WorkerTypes.consumer} worker STOPPED, worker thread id: ${workerThreadId}`);
    })
}

export {runConsumer}


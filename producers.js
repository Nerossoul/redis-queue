import {STREAM_NAME} from "./config.js";

import {producersCount, WorkerTypes} from "./config.js";
import {runWorkerProcess} from "./utils/runWorkerProcess.js";

const currentWorkers = []

const addWorker = (worker) => currentWorkers.push(worker)

function runProducers() {
    for (let i = 1; i <= producersCount; i += 1) {
        runWorkerProcess(
            './producerWorker.js',
            {streamName: STREAM_NAME},
            WorkerTypes.producer,
            addWorker);
    }
}

function stopProducers() {
    currentWorkers.forEach(async worker => {
        const workerThreadId = worker.threadId
        await worker.terminate()
        // console.log(`${WorkerTypes.producer} worker STOPPED, worker thread id: ${workerThreadId}`);
    })
}

export {runProducers, stopProducers}


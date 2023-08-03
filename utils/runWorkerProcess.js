import {Worker} from "worker_threads";

export function runWorkerProcess(workerFilePath, workerData, workerType, addWorkerCb = () => {
}) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerFilePath, {
            workerData,
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code === 1) {
                resolve()
            }
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });

        // console.log(`${workerType} worker STARTED, worker thread id: `, worker.threadId);
        addWorkerCb(worker);
    });
};

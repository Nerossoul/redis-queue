import {workerData} from "worker_threads";

import {producerFrequencyMs} from "./config.js";
import {addDataToQueue} from "./utils/addDataToQueue.js";

import {createClient} from 'redis';

const client = createClient();

await client.connect();

const iterate = (intervalMs) => {
    setTimeout(async () => {
        await addDataToQueue(client, workerData.streamName);
        iterate(intervalMs)
    }, intervalMs)
}

iterate(producerFrequencyMs)


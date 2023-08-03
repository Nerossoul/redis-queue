import {workerData, parentPort} from "worker_threads";
import {createClient , commandOptions} from 'redis';

import {rangeMax} from "./config.js";

const client = createClient();

await client.connect();

while (true) {
    try {
        let response = await client.xReadGroup(
            commandOptions({
                isolated: true
            }),
            workerData.groupName,
            `consumerName${workerData.workerNumber}`, [
                {
                    key: workerData.streamName,
                    id: '>' // Next entry ID that no consumer in this group has read
                }
            ], {
                // Read 1 entry at a time, block for 5 seconds if there are none.
                COUNT: 10,
                BLOCK: 5
            }
        );

        if (response) {
            response[0].messages.forEach((messageInformation)=>{
                const numberValue = messageInformation.message.number

                const time = messageInformation.id.split("-")[0]

                if (!workerData.sharedArray[numberValue]) {
                    workerData.sharedArray[numberValue] = BigInt(time)
                }

                const entryId = messageInformation.id
                client.xAck(workerData.streamName, workerData.groupName, entryId);

                const isContainZeroElements = Array.from(workerData.sharedArray).some(element=>element === 0n)
                if (!isContainZeroElements) {
                    parentPort.postMessage({message: "Finished"})
                }
            });
        }
    } catch (err) {
        await client.disconnect();
        console.error(err);
    }
}



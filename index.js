import {runProducers, stopProducers} from "./producers.js";
import {runConsumer} from "./consumer.js";

import * as fs from 'fs';

runProducers()

const start = Date.now()
const resultArray = await runConsumer()
const end = Date.now()

const result = {
    timeSpent: end - start,
    numbersGenerated: Array.from(resultArray).map((_, index) => index),
    timeForEachNumber: Array.from(resultArray).map(bigInt => bigInt.toString())
}

stopProducers()

await fs.promises.writeFile('./tmp/result.txt', JSON.stringify(result));

console.log(result)



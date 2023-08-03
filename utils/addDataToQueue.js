import {getRandomNumber} from "./getRandomNumber.js";
import {rangeMax} from "../config.js";

export const addDataToQueue = async (redisClient, streamName) => {
    const number = getRandomNumber(rangeMax)
   await redisClient.xAdd(
        streamName,
        '*',
        {
            number: number.toString()
        },
        {
            TRIM: {
                strategy: 'MAXLEN', // Trim by length.
                strategyModifier: '~', // Approximate trimming.
                threshold: 10000 // Retain around 10000 entries.
            }
        }
    );
}

import { ILabelDetails } from "../interfaces/interfaces";
import axios, { AxiosResponse } from "axios";
import chalk from "chalk";
import { APP_NAME, CONSUMER_KEY, CONSUMER_SECRET } from "../config";
import { timer } from "../utils";

export async function getLabelDetails(labelId: number): Promise<ILabelDetails | null> {
    try {
        const response: AxiosResponse<ILabelDetails> = await axios.get(`https://api.discogs.com/labels/${labelId}`, {
            headers: {
                'User-Agent': APP_NAME,
                'Authorization': `Discogs key=${CONSUMER_KEY}, secret=${CONSUMER_SECRET}`
            }
        });

        return response.data;
    } catch (error) {
        console.error(chalk.red('Error getting label details:'), (error as Error).message);
        if (error.response.status === 429) {
            // If rate limit exeded wait for 1 minute
            await timer(1000 * 60);
            return getLabelDetails(labelId);
        }
        return null;
    }
}
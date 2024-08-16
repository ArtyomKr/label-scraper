import { ILabelSearchResponse } from "../interfaces/interfaces";
import axios, { AxiosResponse } from "axios";
import { APP_NAME, CONSUMER_KEY, CONSUMER_SECRET } from "../config";

export async function searchLabels(page: number = 1, per_page: number = 1): Promise<ILabelSearchResponse> {
    try {
        const response: AxiosResponse<ILabelSearchResponse> = await axios.get('https://api.discogs.com/database/search', {
            params: {
                type: 'label',
                page: page,
                per_page: 1,
            },
            headers: {
                'User-Agent': APP_NAME,
                'Authorization': `Discogs key=${CONSUMER_KEY}, secret=${CONSUMER_SECRET}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error searching labels:', (error as Error).message);
        throw error;
    }
}
import dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import chalk from 'chalk';
import { open, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

dotenv.config();

const consumerKey = process.env.DISCORGS_KEY;
const consumerSecret = process.env.DISCORGS_SECRET;
const outputFile = process.env.OUTPUT_FILE;
const delay = process.env.DELAY || 1000;

const appName = 'LabelScraper/1.0';

interface ILabelSearchResponse {
    pagination: {
        items: number;
        page: number;
        pages: number;
        per_page: number;
        urls: {
            last: string;
            next: string;
        }
    };
}

interface ILabelDetails {
    id: number;
    name: string;
    contact_info?: string;
    urls?: string[];
    profile?: string;
}

interface IFormattedData {
    id: number;
    name: string | null;
    email: string | null;
    urls: string[] | null;
    profile: string | null;
}

async function searchLabels(page: number = 1, per_page: number = 1): Promise<ILabelSearchResponse> {
    try {
        const response: AxiosResponse<ILabelSearchResponse> = await axios.get('https://api.discogs.com/database/search', {
            params: {
                type: 'label',
                page: page,
                per_page: 1,
            },
            headers: {
                'User-Agent': appName,
                'Authorization': `Discogs key=${consumerKey}, secret=${consumerSecret}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error searching labels:', (error as Error).message);
        throw error;
    }
}

async function getLabelDetails(labelId: number): Promise<ILabelDetails | null> {
    try {
        const response: AxiosResponse<ILabelDetails> = await axios.get(`https://api.discogs.com/labels/${labelId}`, {
            headers: {
                'User-Agent': appName,
                'Authorization': `Discogs key=${consumerKey}, secret=${consumerSecret}`
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

async function timer(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function appendResultToFile(result: IFormattedData) {
    if (!existsSync(outputFile)) {
        await writeFile(outputFile, '[]');
    }
    try {
        let fileHandle;
        try {
            fileHandle = await open(outputFile, 'r+');
            const fileSize = (await fileHandle.stat()).size;
            const firstLine = fileSize <= 2;

            if (firstLine) {
                await fileHandle.write(JSON.stringify(result, null, 2) + ']', fileSize - 1);
                return;
            }

            await fileHandle.write(',', fileSize - 1);
            await fileHandle.write(JSON.stringify(result, null, 2) + ']', fileSize);

            console.log(chalk.green('Result appended to file:', outputFile));
        } finally {
            await fileHandle.close();
        }
    } catch (error) {
        console.error(chalk.red('Error appending result to file:', (error as Error).message));
    }
}

async function getProcessedData(): Promise<IFormattedData[]> {
    try {
        const fileData = await readFile(outputFile, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error(chalk.red('Error reading processed data:', (error as Error).message));
        return [];
    }
}

function formatData(labelData: ILabelDetails): IFormattedData | null {
    let contactEmail: string | null = null;
    if (labelData.contact_info) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const match = labelData.contact_info.match(emailRegex);
        contactEmail = match ? match[0] : null;
    }
    if (!labelData.urls && !contactEmail) return null;
    return {
        id: labelData.id,
        name: labelData.name,
        email: contactEmail,
        urls: labelData.urls ?? null,
        profile: labelData.profile ?? null
    };
}

async function main() {
    console.log('Output file:', outputFile);

    const labelsSearchRes = await searchLabels();
    const totalLabels = labelsSearchRes.pagination.items;
    const processedData = await getProcessedData();
    const lastIndex = processedData.length > 0 ? processedData[processedData.length - 1].id : 0;

    console.log(chalk.bgBlue('Total Labels:'), totalLabels);

    for (let i = lastIndex + 1; i <= totalLabels; i++) {
        const labelDetails = await getLabelDetails(i);
        const startTime = Date.now();

        if (labelDetails) {
            const formattedData = formatData(labelDetails);
            if (formattedData) {
                await appendResultToFile(formattedData);
            }
        }

        const elapsedTime = Date.now() - startTime;
        const remainingDelay = delay - elapsedTime;

        if (remainingDelay > 0) {
            await timer(remainingDelay);
        }
        console.log(chalk.bgGreen(`Processed label ${i} of ${totalLabels}`));
    }
}

main().catch(error => console.error(chalk.red('An error occurred:', error)));
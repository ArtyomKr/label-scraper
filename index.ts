import chalk from 'chalk';
import { DELAY, REQUEST_EVERY_NTH, REQUEST_START_OFFSET } from "./config";
import { searchLabels } from "./requests/searchLabels";
import { appendResultToFile, formatData, getProcessedData, timer } from "./utils";
import { getLabelDetails } from "./requests/getLabelDetails";

async function main() {
    const labelsSearchRes = await searchLabels();
    const totalLabels = labelsSearchRes.pagination.items;
    const processedData = await getProcessedData();
    const lastIndex = processedData.length > 0 ? processedData[processedData.length - 1].id : 0;

    console.log(chalk.bgBlue('Total Labels:'), totalLabels);

    for (let i = Math.max(lastIndex + 1, REQUEST_START_OFFSET); i <= totalLabels; i += REQUEST_EVERY_NTH) {
        const labelDetails = await getLabelDetails(i);
        const startTime = Date.now();

        if (labelDetails) {
            const formattedData = formatData(labelDetails);
            if (formattedData) {
                await appendResultToFile(formattedData);
            }
        }

        const elapsedTime = Date.now() - startTime;
        const remainingDelay = DELAY - elapsedTime;

        if (remainingDelay > 0) {
            await timer(remainingDelay);
        }
        console.log(chalk.bgGreen(`Processed label ${i} of ${totalLabels}`));
    }
}

main().catch(error => console.error(chalk.red('An error occurred:', error)));
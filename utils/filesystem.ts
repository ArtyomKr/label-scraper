import { IFormattedData } from "../interfaces/interfaces";
import { existsSync } from "fs";
import { OUTPUT_FILE } from "../config";
import { open, readFile, writeFile } from "fs/promises";
import chalk from "chalk";

export async function appendResultToFile(result: IFormattedData) {
    if (!existsSync(OUTPUT_FILE)) {
        await writeFile(OUTPUT_FILE, '[]');
    }
    try {
        let fileHandle;
        try {
            fileHandle = await open(OUTPUT_FILE, 'r+');
            const fileSize = (await fileHandle.stat()).size;
            const firstLine = fileSize <= 2;

            if (firstLine) {
                await fileHandle.write(JSON.stringify(result, null, 2) + ']', fileSize - 1);
                return;
            }

            await fileHandle.write(',', fileSize - 1);
            await fileHandle.write(JSON.stringify(result, null, 2) + ']', fileSize);

            console.log(chalk.green('Result appended to file:', OUTPUT_FILE));
        } finally {
            await fileHandle.close();
        }
    } catch (error) {
        console.error(chalk.red('Error appending result to file:', (error as Error).message));
    }
}

export async function getProcessedData(): Promise<IFormattedData[]> {
    try {
        const fileData = await readFile(OUTPUT_FILE, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error(chalk.red('Error reading processed data:', (error as Error).message));
        return [];
    }
}
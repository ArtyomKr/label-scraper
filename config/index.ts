import dotenv from "dotenv";

dotenv.config();

const CONSUMER_KEY = process.env.DISCORGS_KEY;
const CONSUMER_SECRET = process.env.DISCORGS_SECRET;
const OUTPUT_FILE = process.env.OUTPUT_FILE;
const DELAY = +process.env.DELAY || 1000;
const REQUEST_EVERY_NTH = +process.env.REQUEST_EVERY_NTH || 1;
const REQUEST_START_OFFSET = +process.env.REQUEST_START_OFFSET || 0;
const APP_NAME = 'LabelScraper/1.0';


export { CONSUMER_KEY, CONSUMER_SECRET, OUTPUT_FILE, DELAY, REQUEST_EVERY_NTH, REQUEST_START_OFFSET, APP_NAME };
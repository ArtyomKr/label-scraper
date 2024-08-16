import {IFormattedData, ILabelDetails} from "../interfaces/interfaces";
import { appendResultToFile, getProcessedData } from "./filesystem";

async function timer(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

function formatData(labelData: ILabelDetails): IFormattedData | null {
    let contactEmail = null;
    let contactPhone = null;
    if (labelData.contact_info) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const phoneRegex = /\(?\+[0-9]{1,3}\)? ?-?[0-9]{1,3} ?-?[0-9]{3,5} ?-?[0-9]{4}( ?-?[0-9]{3})? ?(\w{1,10}\s?\d{1,6})?/g;
        const emailMatch = labelData.contact_info.match(emailRegex);
        const phoneMatch = labelData.contact_info.match(phoneRegex);
        contactEmail = emailMatch ? emailMatch[0] : null;
        contactPhone = phoneMatch ? phoneMatch[0] : null;
    }
    if (!labelData.urls && !contactEmail) return null;
    return {
        id: labelData.id,
        name: labelData.name,
        email: contactEmail,
        phone: contactPhone,
        urls: labelData.urls ?? null,
        profile: labelData.profile ?? null
    };
}

export { timer, formatData, appendResultToFile, getProcessedData };

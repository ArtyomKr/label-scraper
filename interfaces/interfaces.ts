export interface ILabelSearchResponse {
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

export interface ILabelDetails {
    id: number;
    name: string;
    contact_info?: string;
    urls?: string[];
    profile?: string;
}

export interface IFormattedData {
    id: number;
    name: string | null;
    email: string | null;
    urls: string[] | null;
    profile: string | null;
}
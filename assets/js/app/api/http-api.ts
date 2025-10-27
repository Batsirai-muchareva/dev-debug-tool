import { getSettings } from "../sync/get-settings";

export const httpApi = () => {
    const settings = getSettings();

    return {
        post: async (url: string, data: URLSearchParams) => {
            const response = await fetch( settings.baseUrl + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: data
            });

            if ( ! response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return {
                data: await response.json()
            };
        }
    };
};

import type { BasicCharacterProfile, CharacterProfile } from '../types';

type ResponseError = {
    error: string;
    message: string;
    statusCode: number;
}

export class RaiderApi {
    private readonly apiBaseUrl: string = 'https://raider.io/api/v1/';

    public getCharacterProfile({ region, realm, name }: BasicCharacterProfile, extraFields: string[] = []): Promise<CharacterProfile> {
        const searchParams = this.createSearchParamsForCharacterProfile({ region, realm, name });

        if (extraFields.length) {
            searchParams.set('fields', extraFields.join(','));
        }

        return this.fetchData('characters/profile', searchParams.toString());
    }

    private createSearchParamsForCharacterProfile(character: BasicCharacterProfile): URLSearchParams {
        const params = new URLSearchParams();
    
        for (const param of Object.keys(character)) {
            if (['id'].includes(param)) {
                continue;
            }

            const value = character[param as keyof BasicCharacterProfile];

            if (value == null) {
                continue;
            }
            
            params.set(param, value);
        }
    
        return params;
    }

    private isResponseError(response: any): response is ResponseError {
        return typeof response.error === 'string';
    }

    private async fetchData<T>(apiPathName: string, search = ''): Promise<T> {
        const url = new URL(apiPathName, this.apiBaseUrl);
        
        url.search = search;

        const response: T | ResponseError = await fetch(url, { signal: AbortSignal.timeout(5000) }).then((res) => res.json());

        if (this.isResponseError(response)) {
            const { message } = response;

            throw new Error(message);
        }

        return response;
    }
}

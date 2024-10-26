export class RaiderApi {
    apiBaseUrl = 'https://raider.io/api/v1/';

    getCharacterProfile({ region, realm, name }, extraFields = []) {
        const searchParams = this.createSearchParamsForCharacterProfile({ region, realm, name });

        if (extraFields.length) {
            searchParams.set('fields', extraFields.join(','));
        }

        return this.fetchData('characters/profile', searchParams.toString());
    }

    getMythicPlusScoreTiersColors() {
        return this.fetchData('mythic-plus/score-tiers');
    }

    createCharacterObj(character) {
        const [region, realm, name] = character.split('/');
    
        return {
            id: character,
            region,
            realm,
            name
        };
    }

    createSearchParamsForCharacterProfile(character, extraFields = []) {
        const params = new URLSearchParams();
    
        for (const param of Object.keys(character)) {
            if (!['id'].includes(param)) {
                params.set(param, character[param]);
            }
        }
    
        return params;
    }

    fetchData(apiPathName, search = '') {
        const url = new URL(apiPathName, this.apiBaseUrl);
        
        url.search = search;

        return fetch(url).then((response) => response.json());
    }
}
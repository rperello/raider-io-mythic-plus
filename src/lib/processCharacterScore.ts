import { Character } from '../classes/Character';
import { CharacterProfile } from '../types';

export type CharacterExtendedData = Pick<CharacterProfile, 'region' | 'realm' | 'name' | 'profile_url' | 'thumbnail_url' | 'class'> & {
    score: number;
    color: string;
}

export type CharacterExtendedDataRecord = {
    [character: string]: CharacterExtendedData;
}

export function processCharacterData(result: CharacterProfile, characterExtendedData: CharacterExtendedDataRecord): void {
    const { name, region, realm, profile_url, thumbnail_url, class: classType, mythic_plus_scores_by_season } = result;
    
    if (region == null || realm == null || mythic_plus_scores_by_season == null) {
        return;
    }

    const character = Character.stringify({ realm, region, name });
    
    if (!(character in characterExtendedData)) {
        const [ currentSeason ] = mythic_plus_scores_by_season;

        if (currentSeason == null) {
            return;
        }

        const { score, color } = currentSeason.segments.all ?? { score: 0, color: '#ffffff' };

        characterExtendedData[character] = {
            region,
            realm,
            name,
            profile_url,
            thumbnail_url,
            class: classType,
            score: Math.round(score),
            color
        };
    }
}
import { RaiderApi } from '../services/RaiderApi';
import {
    type DungeonDetails,
    type DungeonsDetailsRecord,
    type MythicBestDungeonRun,
    type MythicBestDungeonRuns,
    processRunsForCharacter
} from './processRunsForCharacter';
import { type CharacterExtendedDataRecord, processCharacterData } from './processCharacterScore';
import { Character } from '../classes/Character';

export type {
    MythicBestDungeonRun,
    MythicBestDungeonRuns,
    CharacterExtendedDataRecord,
    DungeonDetails,
    DungeonsDetailsRecord
};

type Result = {
    mythicBestRunsPerCharacterList: MythicBestDungeonRuns;
    charactersExtendedData: CharacterExtendedDataRecord;
    dungeonsDetails: DungeonsDetailsRecord;
}

export async function getMythicBestRuns(characters: Array<string>, raiderApi: RaiderApi): Promise<Result> {
    if (characters.length === 0) {
        throw new Error('No characters');
    }

    const charactersExtendedData: Result['charactersExtendedData'] = {};

    // TODO: Preserve as soft deleted for later recovery?
    // Remove characters not listed in new characters list
    const previousCharacters = Object.keys(charactersExtendedData);

    for (const previousCharacter of previousCharacters) {
        if (characters.includes(previousCharacter)) {
            continue;
        }

        delete charactersExtendedData[previousCharacter];
    }

    const mythicBestRunsPerCharacterList: MythicBestDungeonRuns = {};
    const dungeonsDetails: DungeonsDetailsRecord = {};

    const promises = [];

    for (const character of characters) {
        const parsedCharacter = Character.parse(character);

        promises.push(raiderApi.getCharacterProfile(parsedCharacter, [
            'mythic_plus_best_runs:all',
            'mythic_plus_scores_by_season:current',
            'previous_mythic_plus_ranks'
        ]));
    }

    const results = await Promise.allSettled(promises);

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const character = characters[i];

        if (result?.status !== 'fulfilled' || character == null) {
            continue;
        }

        const { value } = result;

        processCharacterData(value, charactersExtendedData);
        const { bestRunsPerDungeon, dungeons } = processRunsForCharacter(value);

        mythicBestRunsPerCharacterList[character] = bestRunsPerDungeon;
        
        for (const [dungeon, details] of Object.entries(dungeons)) {
            if (dungeon in dungeonsDetails) {
                continue;
            }

            dungeonsDetails[dungeon] = details;
        }
    }

    return {
        mythicBestRunsPerCharacterList,
        charactersExtendedData,
        dungeonsDetails
    }
}
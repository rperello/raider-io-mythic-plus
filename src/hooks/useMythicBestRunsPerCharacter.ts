import { inject, watchEffect, reactive, ref } from 'vue'
import {
    getMythicBestRuns,
    type DungeonsDetailsRecord,
    type CharacterExtendedDataRecord,
    type MythicBestDungeonRun,
    type MythicBestDungeonRuns
} from '../lib/fetchMythicBestRuns';
import { RaiderApi } from '../services/RaiderApi';

export type { MythicBestDungeonRun };

type Result = {
    characterExtendedData: CharacterExtendedDataRecord,
    dungeonsDetails: DungeonsDetailsRecord,
    mythicBestRunsPerCharacter: MythicBestDungeonRuns
};

export function useMythicBestRunsPerCharacter(): [Result, (characters: Array<string>) => void] {
    const raiderApi = inject<RaiderApi>('raiderApi');

    if (raiderApi == null) {
        throw new Error('RaiderApi not defined');
    }

    const charactersRecord = ref<Array<string>>([]);

    const data = reactive<Result>({
        characterExtendedData: {},
        dungeonsDetails: {},
        mythicBestRunsPerCharacter: {}
    });

    watchEffect(async () => {
        if (charactersRecord.value.length === 0) {
            data.characterExtendedData = {};
            data.mythicBestRunsPerCharacter = {};
            return;
        }

        let result;

        try {
            result = await getMythicBestRuns(charactersRecord.value, raiderApi);
        } catch (error) {
            console.error(error);
            return;
        }

        data.characterExtendedData = result.charactersExtendedData;
        data.dungeonsDetails = result.dungeonsDetails;
        data.mythicBestRunsPerCharacter = result.mythicBestRunsPerCharacterList;
    });

    return [data, (characters: Array<string>) => {
        charactersRecord.value = characters;
    }];
}
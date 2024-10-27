import { inject, watchEffect, ref } from 'vue'
import { Character } from '../classes/character';

function getScoreColor(scoreValue, colors) {
    const color = colors.find(({ score }) => score <= scoreValue);

    return color?.rgbHex ?? 'white';
}

export function useMythicBestRunsPerCharacter(data) {
    const raiderApi = inject('raiderApi');

    const characterExtendedData = ref({});
    const mythicBestRunsPerCharacter = ref({});

    watchEffect(async () => {
        const { characters } = data;

        if (characters.length === 0) {
            characterExtendedData.value = {};
            mythicBestRunsPerCharacter.value = {};
            return;
        }

        const mythicBestRunsPerCharacterList = {};
        let colors = [];
    
        try {
            colors = await raiderApi.getMythicPlusScoreTiersColors();
        } catch(err) {
            console.error(err);
        }

        // TODO: Preserve as soft deleted for later recovery?
        // Remove characters not listed in new characters list
        const previousCharacters = Object.keys(characterExtendedData.value);

        for (const previousCharacter of previousCharacters) {
            if (characters.includes(previousCharacter)) {
                continue;
            }

            delete characterExtendedData.value[previousCharacter];
        }
    
        for (const character of characters) {
            const parsedCharacter = Character.parse(character);

            let result;

            try {
                result = await raiderApi.getCharacterProfile(parsedCharacter, [
                    'mythic_plus_best_runs:all',
                    'mythic_plus_alternate_runs:all',
                    'mythic_plus_scores_by_season:current'
                ]);
            } catch (error) {
                continue;
            }
    
            if (!(character in characterExtendedData.value)) {
                const score = Math.round(result.mythic_plus_scores_by_season?.[0].scores.all ?? 0);
    
                characterExtendedData.value[character] = {
                    id: character,
                    ...result,
                    score: Math.round(result.mythic_plus_scores_by_season?.[0].scores.all ?? 0),
                    scoreColor: getScoreColor(score, colors)
                };
            }
    
            const resultCharacter = {
                ...result
            };
    
            delete resultCharacter.mythic_plus_best_runs;
            delete resultCharacter.thumbnail_url;
            delete resultCharacter.profile_url;
    
            const allRuns = result.mythic_plus_best_runs;
    
            allRuns.forEach(run => {
                const completedAt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(run.completed_at));
    
                if (!(run.dungeon in mythicBestRunsPerCharacterList)) {
                    mythicBestRunsPerCharacterList[run.dungeon] = {};
                }
    
                const dungeonBestRuns = mythicBestRunsPerCharacterList[run.dungeon];
    
                if (!(character in dungeonBestRuns)) {
                    dungeonBestRuns[character] = {};
                }
    
                const dungeonCharacterRuns = {
                    id: character,
                    ...parsedCharacter,
                    best_level: run.mythic_level,
                    num_keystone_upgrades: run.num_keystone_upgrades,
                    completed_at: completedAt
                };
    
                if ((run.mythic_level >= dungeonCharacterRuns.best_level && run.num_keystone_upgrades >= dungeonCharacterRuns.num_keystone_upgrades)) {
                    dungeonCharacterRuns.best_level = run.mythic_level;
                    dungeonCharacterRuns.num_keystone_upgrades = run.num_keystone_upgrades;
                    dungeonCharacterRuns.completed_at = completedAt;
                }
    
                dungeonBestRuns[character] = dungeonCharacterRuns;
            });
        }

        mythicBestRunsPerCharacter.value =  mythicBestRunsPerCharacterList;
    });

    return {
        characterExtendedData,
        mythicBestRunsPerCharacter
    };
}
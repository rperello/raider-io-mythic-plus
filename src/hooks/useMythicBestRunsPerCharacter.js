import { watchEffect, ref } from 'vue'

function createCharacterObj (character) {
    const [region, realm, name] = character.split('/');

    return {
        id: character,
        region,
        realm,
        name
    };
}

function createUrlFromCharacter (character, extraFields = []) {
    const url = 'https://raider.io/api/v1/characters/profile?';
    const params = new URLSearchParams();

    for (const param of Object.keys(character)) {
        if (!['id'].includes(param)) {
            params.set(param, character[param]);
        }
    }

    if (extraFields.length) {
        params.set('fields', extraFields.join(','));
    }

    return url + params.toString();
}

function getScoreColor(scoreValue, colors) {
    const color = colors.find(({ score }) => score <= scoreValue);

    return color?.rgbHex ?? 'white';
}

export function useMythicBestRunsPerCharacter(characters) {
    const characterExtendedData = ref({});
    const mythicBestRunsPerCharacter = ref(null);

    watchEffect(async () => {
        // const resultsList = [];
        const mythicBestRunsPerCharacterList = {};
        let colors = [];
    
        try {
            colors = await fetch('https://raider.io/api/v1/mythic-plus/score-tiers').then(res => res.json());
        } catch(err) {
            console.error(err);
        }
    
        for (const character of characters.value) {
            const characterObj = createCharacterObj(character);
            const url = createUrlFromCharacter(characterObj, [
                'mythic_plus_best_runs:all',
                'mythic_plus_alternate_runs:all',
                'mythic_plus_scores_by_season:current'
            ]);
    
            let result;
    
            try {
                result = await fetch(url).then(res => res.json());
            } catch (err) {
                continue;
            }
    
            if (!(character in characterExtendedData.value)) {
                const score = Math.round(result.mythic_plus_scores_by_season?.[0].scores.all ?? 0);
    
                characterExtendedData.value[character] = {
                    ...characterObj,
                    className: result.class.toLowerCase(),
                    thumbnail: result.thumbnail_url,
                    profile_url: result.profile_url,
                    last_crawled_at: result.last_crawled_at,
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
    
            // resultsList.push({
            //     name: characterObj.name,
            //     thumbnail_url: result.thumbnail_url,
            //     character: characterObj,
            //     profile_url: result.profile_url,
            //     runs: allRuns
            // });
    
            allRuns.forEach(run => {
                const characterId = characterObj.id;
                const completedAt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(run.completed_at));
    
                if (!(run.dungeon in mythicBestRunsPerCharacterList)) {
                    mythicBestRunsPerCharacterList[run.dungeon] = {};
                }
    
                const dungeonBestRuns = mythicBestRunsPerCharacterList[run.dungeon];
    
                if (!(characterId in dungeonBestRuns)) {
                    dungeonBestRuns[characterId] = {};
                }
    
                const dungeonCharacterRuns = {
                    ...characterObj,
                    best_level: run.mythic_level,
                    num_keystone_upgrades: run.num_keystone_upgrades,
                    completed_at: completedAt
                };
    
                if ((run.mythic_level >= dungeonCharacterRuns.best_level && run.num_keystone_upgrades >= dungeonCharacterRuns.num_keystone_upgrades)) {
                    dungeonCharacterRuns.best_level = run.mythic_level;
                    dungeonCharacterRuns.num_keystone_upgrades = run.num_keystone_upgrades;
                    dungeonCharacterRuns.completed_at = completedAt;
                }
    
                dungeonBestRuns[characterId] = dungeonCharacterRuns;
            });
        }

        mythicBestRunsPerCharacter.value =  mythicBestRunsPerCharacterList;
    });

    return {
        characterExtendedData,
        mythicBestRunsPerCharacter
    };
}
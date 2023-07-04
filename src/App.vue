<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';
import { watchEffect, ref } from 'vue'

const characters = ref([
  'eu/dunmodr/Iomara',
  'eu/dunmodr/Aunara',
  'eu/dunmodr/Ciomara',
  'eu/dunmodr/Naroua',
  'eu/dunmodr/Siomara'
]);

function createCharacterObj (character) {
    const [region, realm, name] = character.split('/');

    return {
        id: character,
        region,
        realm,
        name
    };
}

const characterExtendedData = ref({});

const results = ref(null);
// const mythicBestRuns = ref(null);
const mythicBestRunsPerCharacter = ref(null);

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

// watchEffect(async () => {
//     const resultsList = [];
//     const mythicBestRunsList = {};

//     for (const character of characters.value) {
//         const characterObj = createCharacterObj(character);
//         const url = createUrlFromCharacter(characterObj, ['mythic_plus_highest_level_runs', 'mythic_plus_scores_by_season:current']);
//         let result;

//         try {
//             result = await fetch(url).then(res => res.json());
//         } catch (err) {
//             continue;
//         }

//         if (!(character in characterExtendedData.value)) {
//             characterExtendedData.value[character] = {
//                 ...characterObj,
//                 className: result.class.toLowerCase(),
//                 thumbnail: result.thumbnail_url
//             };
//         }

//         const resultCharacter = {
//             ...result
//         };

//         delete resultCharacter.mythic_plus_highest_level_runs;
//         delete resultCharacter.thumbnail_url;

//         console.log(result.thumbnail_url);

//         // if (!(result.mythic_plus_highest_level_runs in result)) {
//         //     continue;
//         // }

//         resultsList.push({
//             name: characterObj.name,
//             thumbnail_url: result.thumbnail_url,
//             character: characterObj,
//             runs: result.mythic_plus_highest_level_runs
//         });

//         result.mythic_plus_highest_level_runs.forEach(run => {
//             if (!(run.dungeon in mythicBestRunsList) || run.mythic_level >= mythicBestRunsList[run.dungeon].best_level) {
//                 const completedAt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(run.completed_at));

//                 mythicBestRunsList[run.dungeon] = {
//                     ...characterObj,
//                     best_level: run.mythic_level,
//                     completed_at: completedAt
//                 };
//             }
//         });
//     }

//     results.value = resultsList;
//     mythicBestRuns.value =  mythicBestRunsList;

//     console.log({ mythicBestRunsList, characterExtendedData: characterExtendedData.value });
// });

watchEffect(async () => {
    const resultsList = [];
    const mythicBestRunsPerCharacterList = {};

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
            // const lastCrawledAt = new Intl.DateTimeFormat('en-GB').format(new Date(result.last_crawled_at));
            
            console.log(result);
            characterExtendedData.value[character] = {
                ...characterObj,
                className: result.class.toLowerCase(),
                thumbnail: result.thumbnail_url,
                last_crawled_at: result.last_crawled_at,
                score: Math.round(result.mythic_plus_scores_by_season?.[0].scores.all ?? 0)
            };
        }

        const resultCharacter = {
            ...result
        };

        // delete resultCharacter.mythic_plus_highest_level_runs;
        delete resultCharacter.mythic_plus_best_runs;
        delete resultCharacter.mythic_plus_alternate_runs;
        delete resultCharacter.thumbnail_url;

        const allRuns = result.mythic_plus_best_runs.concat(result.mythic_plus_alternate_runs)

        resultsList.push({
            name: characterObj.name,
            thumbnail_url: result.thumbnail_url,
            character: characterObj,
            // runs: result.mythic_plus_highest_level_runs
            runs: allRuns
        });

        allRuns.forEach(run => {
            const characterId = characterObj.id;
            const completedAt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(run.completed_at));

            if (!(run.dungeon in mythicBestRunsPerCharacterList)) {
                mythicBestRunsPerCharacterList[run.dungeon] = {};
            }

            const mode = run.affixes.filter((affix) => ['Tyrannical', 'Fortified'].includes(affix.name)).map(affix => affix.name);
            run.mode = mode;

            const dungeonBestRuns = mythicBestRunsPerCharacterList[run.dungeon];

            if (!(characterId in dungeonBestRuns)) {
                dungeonBestRuns[characterId] = {};
            }

            const dungeonCharacterRuns = dungeonBestRuns[characterId];

            if (!(mode in dungeonCharacterRuns)) {
                dungeonCharacterRuns[mode] = {
                    ...characterObj,
                    best_level: run.mythic_level,
                    num_keystone_upgrades: run.num_keystone_upgrades,
                    completed_at: completedAt
                };
            }

            const dungeonModeCharacterRuns = dungeonCharacterRuns[mode];

            // console.log({ run });
            if ((run.mythic_level >= dungeonModeCharacterRuns.best_level && run.num_keystone_upgrades >= dungeonModeCharacterRuns.num_keystone_upgrades)) {
                dungeonModeCharacterRuns.best_level = run.mythic_level;
                dungeonModeCharacterRuns.num_keystone_upgrades = run.num_keystone_upgrades;
                dungeonModeCharacterRuns.completed_at = completedAt;
            }
        });
    }

    results.value = resultsList;
    mythicBestRunsPerCharacter.value =  mythicBestRunsPerCharacterList;

    // console.log({ resultsList, mythicBestRunsPerCharacterList, characterExtendedData: characterExtendedData.value });
});
</script>

<template>
    <h1 style="text-align: center; font-size: 2rem; margin-bottom: 4rem;">Raider IO best mythic dungeon runs</h1>

    <!-- <div style="display: flex; margin-bottom: 1rem; column-gap: 2px; font-weight: bold; padding: 2px;">
        <div v-for="character in characterExtendedData" :key="character" class="character my-shadow" :class="`${character.className}-class`">
            <img :src="character.thumbnail" :alt="character.name"/>
            <span>{{ character.name }} ({{ character.realm }})</span>
        </div>
    </div> -->

    <MythicBestRunsPerCharacter v-if="mythicBestRunsPerCharacter != null" :mythic-best-runs-per-character="mythicBestRunsPerCharacter" :characters="characterExtendedData"></MythicBestRunsPerCharacter>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';
import { watchEffect, ref } from 'vue'

const characters = ref([
  'eu/dunmodr/Iomara',
  'eu/dunmodr/Naroa',
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

function getScoreColor(scoreValue, colors) {
    const color = colors.find(({ score }) => score <= scoreValue);

    return color?.rgbHex ?? 'white';
}

watchEffect(async () => {
    const resultsList = [];
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

        resultsList.push({
            name: characterObj.name,
            thumbnail_url: result.thumbnail_url,
            character: characterObj,
            profile_url: result.profile_url,
            runs: allRuns
        });

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

    results.value = resultsList;
    mythicBestRunsPerCharacter.value =  mythicBestRunsPerCharacterList;
});
</script>

<template>
    <h1 style="text-align: center; font-size: 2rem; margin-bottom: 4rem;">Raider IO best mythic dungeon runs</h1>

    <MythicBestRunsPerCharacter
        v-if="mythicBestRunsPerCharacter != null"
        :mythic-best-runs-per-character="mythicBestRunsPerCharacter"
        :characters="characterExtendedData"
    />
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

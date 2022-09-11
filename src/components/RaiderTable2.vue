<script setup>
    import { watchEffect, computed, ref } from 'vue'
    
    const props = defineProps({
        characters: {
            type: Array,
            default: () => []
        }
    });
    
    const characters = computed(() => {
        return props.characters.map(character => {
            const [region, realm, name] = character.split('/');
    
            return {
                region,
                realm,
                name
            };
        });
    });
    
    const results = ref(null);
    
    function createUrlFromCharacter (character, extraFields = []) {
        const url = 'https://raider.io/api/v1/characters/profile?';
        const params = new URLSearchParams();
    
        for (const param of Object.keys(character)) {
            params.set(param, character[param]);
        }
    
        console.log({ extraFields });
        if (extraFields.length) {
            params.set('fields', extraFields.join(','));
        }
    
        return url + params.toString();
    }
    
    watchEffect(async () => {
        const resultsList = [];
    
        for (const character of characters.value) {
            const url = createUrlFromCharacter(character, ['mythic_plus_highest_level_runs', 'mythic_plus_scores_by_season:current']);
            const result = await fetch(url).then(res => res.json());
            const resultCharacter = {
                ...result
            };
    
            delete resultCharacter.mythic_plus_highest_level_runs;
            delete resultCharacter.thumbnail_url;
    
            resultsList.push({
                name: character,
                thumbnail_url: result.thumbnail_url,
                character: resultCharacter,
                runs: result.mythic_plus_highest_level_runs
            });
        }
    
        results.value = resultsList;
    });
    </script>
    
    <template>
        <div v-if="results != null">
            <div
                v-for="result in results"
                :key="result.character"
            >
                <figure v-if="'thumbnail_url' in result">
                    <img :src="result.thumbnail_url" alt="character thumbnail" />
                </figure>
    
                <h2>Character</h2>
    
                <table aria-describedby="Character Details">
                    <tbody>
                        <tr v-for="stat in Object.entries(result.character)">
                            <th>{{ stat[0] }}</th>
                            <th>{{ stat[1] }}</th>
                        </tr>
                    </tbody>
                </table>
        
                <h2>Mythic Plus Highest Level Runs</h2>
        
                <table
                    v-if="Array.isArray(result.runs)"
                    ariaDescribedby="Character Runs"
                >
                    <caption>Character Runs</caption>
                    <tbody>
                        <tr v-for="(run, index) in result.runs">
                            <th>{{ run.dungeon }}</th>
                            <th>{{ run.mythic_level }}</th>
                            <th>{{ run }}</th>
                        </tr>
                    </tbody> 
                </table>
            </div>
        </div>
    </template>
    
<script setup>
import { computed } from 'vue';
import CharacterBadge from './CharacterBadge.vue';
import { useMythicBestRunsPerCharacter } from '../hooks/useMythicBestRunsPerCharacter';

const emit = defineEmits(['removeCharacter']);

const props = defineProps({
    characters: {
        type: Array,
        default: () => ([])
    }
});

const { characterExtendedData, mythicBestRunsPerCharacter } = useMythicBestRunsPerCharacter({ characters: props.characters });
const dungeons = computed(() => mythicBestRunsPerCharacter.value != null ? Object.keys(mythicBestRunsPerCharacter.value) : []);

function removeCharacter(characterId) {
    emit('removeCharacter', characterId);
}
</script>

<template>
    <div>
        <table
            v-if="Object.keys(mythicBestRunsPerCharacter).length > 0"
            aria-describedby="Best run per mythic dungeon and character"
        >
            <thead>
                <tr>
                    <th class="text-left" rowspan="2" style="vertical-align: bottom;">Character</th>
                    
                    <th v-for="dungeon in dungeons">
                        <span style="display: inline-block;">{{ dungeon }}</span>
                    </th>

                    <th rowspan="2" style="vertical-align: bottom;">Score</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="character in characterExtendedData">
                    <td class="transparent-background">
                        <CharacterBadge
                            :character="character"
                            :enableRemove="true"
                            @removeCharacter="removeCharacter"
                        />
                    </td>

                    <template v-for="(dungeon, id) in mythicBestRunsPerCharacter" :key="dungeon">
                        <td
                            v-if="character.id in dungeon"
                            :title="dungeon.completed_at"
                        >
                            <div style="display: flex; justify-content: center; align-items: center; column-gap: 2px;">
                                <span style="margin-right: 4px;">
                                    <strong>{{ dungeon[character.id].best_level }}</strong>
                                </span>

                                <span v-for="star in new Array(dungeon[character.id].num_keystone_upgrades).fill('⭐')" style="font-size: 8px;">
                                    {{ star }}
                                </span>
                            </div>
                        </td>

                        <td v-else>&nbsp;</td>
                    </template>

                    <td>
                        <strong v-if="character.score > 0" :style="{ color: character.scoreColor }">{{ character.score }}</strong>
                        <span v-else>&nbsp;</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else>
            Keep calm<br>Loading data for {{ characters.length }} characters...
        </div>
    </div>
</template>
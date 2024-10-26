<script setup>
import { computed } from 'vue'

const props = defineProps({
    mythicBestRunsPerCharacter: {
        type: Object,
        default: () => ({})
    },
    characters: {
        type: Object,
        default: () => ({})
    }
});

const dungeons = computed(() => Object.keys(props.mythicBestRunsPerCharacter));
</script>

<template>
    <table aria-describedby="Best run per mythic dungeon and character">
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
            <tr v-for="character in characters">
                <td class="text-left" :class="`${character.className}-class`">
                    <div style="display: flex; justify-content: start; align-items: center; column-gap: 8px;">
                        <img :src="character.thumbnail" :alt="character.name"/>
                        <a
                            :href="character.profile_url"
                            target="_blank"
                        >
                            <strong>{{ character.name }}&nbsp;({{ character.realm }})</strong>
                        </a>
                    </div>
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
</template>
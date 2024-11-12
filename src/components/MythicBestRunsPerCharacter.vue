<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import CharacterBadge from './CharacterBadge.vue';
import { useMythicBestRunsPerCharacter, type MythicBestDungeonRun } from '../hooks/useMythicBestRunsPerCharacter';

interface Props {
    characters: Array<string>;
}

const props = defineProps<Props>();

const emit = defineEmits(['removeCharacter']);

const [data, setCharacters] = useMythicBestRunsPerCharacter();
const dungeons = computed(() => Object.keys(data.dungeonsDetails));

watchEffect(() => {
    setCharacters(props.characters);
});

function getRunForCharacterAndDungeon(character: string, dungeon: string): MythicBestDungeonRun | undefined {
    // @ts-ignore
    return data.mythicBestRunsPerCharacter[character]?.[dungeon];
}
</script>

<template>
    <raider-best-runs-table>
        <table
            v-if="Object.keys(data.mythicBestRunsPerCharacter).length > 0"
            aria-describedby="Best run per mythic dungeon & score"
        >
            <thead>
                <tr>
                    <th class="text-left" rowspan="2">Character</th>
                    
                    <th
                        v-for="[dungeon, details] of Object.entries(data.dungeonsDetails)"
                        class="dungeon"
                        :style="{
                            backgroundImage: `url('${details.backgroundImageUrl}')`
                        }"
                        :title="dungeon"
                    >
                        {{ details.shortName }}
                    </th>

                    <th rowspan="2">Score</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="character in Object.keys(data.characterExtendedData)">
                    <td class="transparent-background">
                        <CharacterBadge
                            :character="data.characterExtendedData[character]"
                            :enable-remove="true"
                            @removeCharacter="emit('removeCharacter', $event)"
                        />
                    </td>

                    <template v-for="dungeon in dungeons">
                        <td
                            v-if="getRunForCharacterAndDungeon(character, dungeon) != null"
                            :title="getRunForCharacterAndDungeon(character, dungeon)!.completedAt"
                        >
                            <div style="display: flex; justify-content: center; align-items: center; column-gap: 2px;">
                                <span style="margin-right: 4px;">
                                    <strong>{{ getRunForCharacterAndDungeon(character, dungeon)!.mythicLevel }}</strong>
                                </span>

                                <span v-for="star in new Array(getRunForCharacterAndDungeon(character, dungeon)!.numKeystoneUpgrades).fill('⭐')" style="font-size: 8px;">
                                    {{ star }}
                                </span>
                            </div>
                        </td>

                        <td v-else>&nbsp;</td>
                    </template>

                    <td>
                        <strong
                            v-if="data.characterExtendedData[character]?.score > 0"
                            :style="{ color: data.characterExtendedData[character]!.color }"
                        >
                            {{ data.characterExtendedData[character]!.score }}
                        </strong>

                        <span v-else>&nbsp;</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-else>
            Keep calm<br>Loading data for {{ characters.length }} characters...
        </div>
    </raider-best-runs-table>
</template>

<style lang="scss">
raider-best-runs-table {
    table {
        box-shadow: 0 0 40px #ff450084;
        background-color: rgba(255, 69, 0, 0.2);
        border-spacing: 1px;
        color: white;
        margin-top: 1em;

        thead {
            font-size: 12px;

            th {
                vertical-align: bottom;

                &:first-child {
                    text-align: left;
                }

                &.dungeon {
                    background-position: center center;
                    background-attachment: scroll;
                    background-size: cover;
                    background-repeat: no-repeat;
                    text-shadow: 0 0 10px #000, 0 0 1px #000;
                    padding: 16px 10px;
                    min-width: 70px;
                }
            }
        }

        td,
        th {
            padding: 8px 14px;
        }

        th {
            background-color: #31313122;
        }
            
        td {
            background-color: #1a1a1a;
            vertical-align: middle;

            &.transparent-background {
                background-color: transparent;
                padding: 0;
            }

            .run-stat {
                display: flex;
                justify-content: center;
                align-items: center;
                column-gap: 4px;
                font-weight: bold;

                .stars {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    column-gap: 2px;
                    font-size: 8px;
                }
            }

            .score {
                font-weight: bold;
            }
        }
    }
}
</style>
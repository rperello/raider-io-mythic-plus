<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';
import AddCharacter from './components/AddCharacter.vue';
import { computed, inject, reactive, watchEffect } from 'vue'
import { useMythicBestRunsPerCharacter } from './hooks/useMythicBestRunsPerCharacter';
import { serializeCharacter } from './utils/character';

const persistence = inject('persistence');
const data = reactive({
    characters: persistence.getItem('characters', [])
});

watchEffect(() => {
    const { characters } = data;
    const numCharacters = characters.length;

    const charactersInPersistence = persistence.getItem('characters', []);

    if (numCharacters === charactersInPersistence) {
        return;
    }

    persistence.setItem('characters', characters);
});

const provisionalCharacterProfiles = reactive([]);

const alreadyExistingCharacters = computed(() => {
    const characters = data.characters.slice(0);

    for (const characterProfile of provisionalCharacterProfiles) {
        const character = serializeCharacter(characterProfile);
    
        characters.push(character.toLowerCase());
    }

    return characters;
});

function addCharacterProfile(characterProfile) {
    if (data.characters.length > 0) {
        const newCharacter = serializeCharacter(characterProfile);
        const alreadyExistingCharacter = data.characters.includes(newCharacter.toLowerCase());

        if (!alreadyExistingCharacter) {
            data.characters.push(newCharacter);
        }
    } else {
        const alreadyProvisionalCharacter = provisionalCharacterProfiles.find((profile) => characterProfile.profile_url === profile.profile_url);
    
        if (!alreadyProvisionalCharacter) {
            provisionalCharacterProfiles.push(characterProfile);
        }
    }
}

function addNewCharacters() {
    const newCharacters = [];

    for (const characterProfile of provisionalCharacterProfiles) {
        const character = serializeCharacter(characterProfile);
    
        newCharacters.push(character);
    }

    data.characters.push(...newCharacters);
}

const { characterExtendedData, mythicBestRunsPerCharacter } = useMythicBestRunsPerCharacter(data);
</script>

<template>
    <h1 style="text-align: center; font-size: 2rem; margin-bottom: 4rem; line-height: 1.41">
        The War Within Expansion<br>
        Raider IO best mythic dungeon runs
    </h1>

    <div v-if="data.characters.length">
        <div v-if="mythicBestRunsPerCharacter != null">
            <div style="display: flex; justify-content: start; padding: 0.5em 0.5em 0.5em 0;">
                <AddCharacter
                    :existingCharacters="alreadyExistingCharacters"
                    @addedCharacter="addCharacterProfile"
                />
            </div>

            <MythicBestRunsPerCharacter
                :mythic-best-runs-per-character="mythicBestRunsPerCharacter"
                :characters="characterExtendedData"
            />
        </div>

        <p v-else>
            Loading data...
        </p>
    </div>

    <div v-else>
        <p>No characters. Please, add one</p>

        <div style="display: flex; justify-content: center; padding: 0.5rem;">
            <AddCharacter
                :existingCharacters="alreadyExistingCharacters"
                @addedCharacter="addCharacterProfile"
            />
        </div>

        <div v-if="provisionalCharacterProfiles.length > 0" style="margin: 1em 0 2em;">
            <button @click="addNewCharacters">ADD ALL CHARACTERS</button>
        </div>

        <div
            v-for="character in provisionalCharacterProfiles"
            style="display: flex; align-items: center; flex-direction: column; row-gap: 0.5em; margin: 0.5em 0;"
        >
            <div
                class="character"
                :class="`${character.class.toLowerCase()}-class`"
                style="display: flex; justify-content: center; align-items: center; column-gap: 8px; width: 200px; padding: 8px 14px;"
            >
                <img :src="character.thumbnail_url" :alt="character.name"/>

                <a
                    :href="character.profile_url"
                    target="_blank"
                >
                    <strong>{{ character.name }}&nbsp;({{ character.realm }})</strong>
                </a>
            </div>
        </div>
    </div>
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

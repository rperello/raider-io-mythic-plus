<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { computed, inject, reactive, ref, watchEffect } from 'vue'
import AddCharacter from './components/AddCharacter.vue';
import CharacterBadge from './components/CharacterBadge.vue'
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';
import ImportDropZone from './components/ImportDropZone.vue';
import { Character } from './classes/character';

const raiderApi = inject('raiderApi');
const persistence = inject('persistence');
const data = reactive({
    characters: persistence.getItem('characters', [])
});

const lastRegion = ref(persistence.getItem('last-region', ''));
const lastRealm = ref(persistence.getItem('last-realm', ''));

watchEffect(() => {
    const { characters } = data;
    const numCharacters = characters.length;

    const charactersInPersistence = persistence.getItem('characters', []);

    if (numCharacters === charactersInPersistence) {
        return;
    }

    persistence.setItem('characters', characters);

    const lastCharacter = characters.at(-1);

    if (lastCharacter) {
        const { region, realm } = Character.parse(lastCharacter);

        if (region != null) {
            lastRegion.value = region;
        }

        if (realm != null) {
            lastRealm.value = realm;
        }
    }
});

watchEffect(() => {
    const lastRegionValue = lastRegion.value;
    const lastRealmValue = lastRealm.value;

    if (lastRegionValue !== persistence.getItem('last-region', '')) {
        persistence.setItem('last-region', lastRegionValue);
    }

    if (lastRealmValue !== persistence.getItem('last-realm', '')) {
        persistence.setItem('last-realm', lastRealmValue);
    }
});

const provisionalCharacterProfiles = reactive([]);

const alreadyExistingCharacters = computed(() => {
    const characters = data.characters.slice(0);

    for (const characterProfile of provisionalCharacterProfiles) {
        const character = Character.stringify(characterProfile);
    
        characters.push(character.toLowerCase());
    }

    return characters;
});

function addCharacterProfile(characterProfile) {
    if (data.characters.length > 0) {
        const newCharacter = Character.stringify(characterProfile);
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
        const character = Character.stringify(characterProfile);
    
        newCharacters.push(character);
    }

    data.characters.push(...newCharacters);
    provisionalCharacterProfiles.splice(0);
}

function removeCharacter(characterId) {
    if (data.characters.length > 0) {
        const characterIndex = data.characters.findIndex((character) => characterId === character);

        if (characterIndex === -1) {
            return;
        }

        data.characters.splice(characterIndex, 1);
    } else {
        const characterIndex = provisionalCharacterProfiles.findIndex((character) => characterId === character.id);

        if (characterIndex === -1) {
            return;
        }

        provisionalCharacterProfiles.splice(characterIndex, 1);
    }
}

async function importCharacters(importedCharacters) {
    const promises = [];

    for (const character of importedCharacters) {
        if (alreadyExistingCharacters.value.includes(character.toLowerCase())) {
            continue;
        }

        const parsedCharacter = Character.parse(character);
        const promise = raiderApi.getCharacterProfile(parsedCharacter);

        promises.push(promise);
    }

    const results = await Promise.allSettled(promises);

    for (const { status, value } of results) {
        if (status === 'rejected' || 'error' in value) {
            continue;
        }

        provisionalCharacterProfiles.push(value);
    }
}
</script>

<template>
    <header style="height: 85px;">
        <img src="/Logo_TheWarWithin.avif" width="180" alt="The War Within official logo">
    </header>

    <main>
        <h1 class="orange-glow">
            Best mythic dungeon runs & score<br>per character
        </h1>

        <div v-if="data.characters.length">
            <div>
                <div style="display: flex; justify-content: start; padding: 0.5em 0.5em 0.5em 0;">
                    <AddCharacter
                        :existingCharacters="alreadyExistingCharacters"
                        :region="lastRegion"
                        :realm="lastRealm"
                        @addedCharacter="addCharacterProfile"
                    />
                </div>

                <MythicBestRunsPerCharacter
                    :characters="data.characters"
                    @removeCharacter="removeCharacter"
                />
            </div>
        </div>

        <div v-else style="display: inline-flex; flex-direction: column; align-items: stretch; row-gap: 1em;">
            <p><strong>No characters. Please, add one via input or drop file with multiple</strong></p>

            <div style="display: flex; flex-direction: row; column-gap: 1em;">
                <ImportDropZone @importedCharacters="importCharacters"/>

                <div>
                    <div style="display: flex; justify-content: center; padding: 0.5rem;">
                        <AddCharacter
                            :existingCharacters="alreadyExistingCharacters"
                            :region="lastRegion"
                            :realm="lastRealm"
                            @addedCharacter="addCharacterProfile"
                        />
                    </div>

                    <div
                        v-if="provisionalCharacterProfiles.length > 0"
                        style="display: inline-flex; align-items: stretch; flex-direction: column; row-gap: 0.5em; margin: 1em 0 2em; padding: 1em; background-color: #fff5; border-radius: 5px;"
                    >
                        <div style="text-align: right;">
                            <button @click="addNewCharacters">Confirm</button>
                        </div>

                        <div
                            style="display: flex; flex-direction: column; align-items: center; row-gap: 0.5em; margin: 0.5em 0;"
                        >
                            <CharacterBadge
                                v-for="character in provisionalCharacterProfiles"
                                :character="character"
                                :enableRemove="true"
                                @removeCharacter="removeCharacter"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
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

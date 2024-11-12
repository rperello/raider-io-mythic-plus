<script setup lang="ts">
import { computed, inject, reactive } from 'vue';
import { CharacterProfile } from './types';
import { Character } from './classes/Character';
import { Persistence } from './services/Persistence';
import AddCharacter from './components/AddCharacter.vue';
import ImportDropZone from './components/ImportDropZone.vue';
import ProvisionalCharacters from './components/ProvisionalCharacters.vue'
import { RaiderApi } from './services/RaiderApi';

interface Props {
    characters: Array<string>;
}

const raiderApi = inject('raiderApi') as RaiderApi;

if (raiderApi == null) {
    throw new Error('RaiderApi not defined');
}

const props = withDefaults(defineProps<Props>(), {
    characters: () => []
});

const emit = defineEmits(['addedNewCharacters']);

const persistence = inject<Persistence>('persistence');

if (persistence == null) {
    throw new Error('Persistence is not defined');
}

const provisionalCharacterProfiles = reactive<Array<CharacterProfile>>([]);

const alreadyExistingCharacters = computed(() => {
    const characters = props.characters.slice(0);

    for (const characterProfile of provisionalCharacterProfiles) {
        const character = Character.stringify(characterProfile);
    
        characters.push(character.toLowerCase());
    }

    return characters;
});

async function onAddNewCharacters(characters: CharacterProfile[] | string[]): Promise<void> {
    const newCharacters: Array<string> = [];

    const promises = [];

    for (const character of characters) {
        const isProfile = typeof character !== 'string';
        newCharacters.push(isProfile ? Character.stringify(character) : character);
        
        if (isProfile) {
            promises.push(Promise.resolve(character));
            continue;
        }
        
        promises.push(validateCharacter(character));
    }

    const results = await Promise.allSettled(promises);

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const character = newCharacters[i];

        if (character == null || result?.status !== 'fulfilled' || !result.value) {
            continue;
        }

        provisionalCharacterProfiles.push(result.value);
    }
}

function validateCharacter(character: string): Promise<CharacterProfile> {
    const parsedCharacter = Character.parse(character);
    return raiderApi.getCharacterProfile(parsedCharacter);
}

function addCharacterProfile(characterProfile: CharacterProfile): void {
    const alreadyProvisionalCharacter = provisionalCharacterProfiles.find((profile) => {
        return characterProfile.profile_url === profile.profile_url
    });

    if (alreadyProvisionalCharacter) {
        return;
    }

    provisionalCharacterProfiles.push(characterProfile);
}

function removeCharacter(characterId: string): void {
    const characterIndex = provisionalCharacterProfiles.findIndex((character) => {
        return character.profile_url.toLowerCase().includes(characterId);
    });

    if (characterIndex === -1) {
        return;
    }

    provisionalCharacterProfiles.splice(characterIndex, 1);
}

function confirm(): void {
    emit('addedNewCharacters', provisionalCharacterProfiles.slice(0));
    provisionalCharacterProfiles.splice(0);
}
</script>

<template>
    <!-- NOTE: Can not use `add-characters` as it references to the default component exported by this file -->
    <raider-add-characters>
        <p><strong>No characters. Please, add one via input or drop file with multiple</strong></p>

        <div style="display: flex; flex-direction: row; column-gap: 1em;">
            <ImportDropZone
                @importedCharacters="onAddNewCharacters"
            />

            <div>
                <div class="add-character-wrapper">
                    <AddCharacter
                        :existingCharacters="alreadyExistingCharacters"
                        @addedCharacter="addCharacterProfile"
                    />
                </div>

                <ProvisionalCharacters
                    v-if="provisionalCharacterProfiles.length > 0"
                    :provisional-characters="provisionalCharacterProfiles"
                    @removeCharacter="removeCharacter"
                    @confirm="confirm"
                />
            </div>
        </div>
    </raider-add-characters>
</template>

<style lang="scss">
raider-add-characters {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    row-gap: 1em;

    .add-character-wrapper {
        display: flex;
        justify-content: center;
        padding: 0.5rem;
    }
}
</style>
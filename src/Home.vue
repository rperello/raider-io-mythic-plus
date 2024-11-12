<script setup lang="ts">
import AddCharacter from './components/AddCharacter.vue';
import { CharacterProfile } from './types';
import { Character } from './classes/Character';
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';

interface Props {
    characters: Array<string>;
}

const props = defineProps<Props>();
const emit = defineEmits(['charactersChanged']);

function addCharacterProfile(characterProfile: CharacterProfile): void {
    const newCharacter = Character.stringify(characterProfile);
    const alreadyExistingCharacter = props.characters.includes(newCharacter.toLowerCase());

    if (!alreadyExistingCharacter) {
        const characters = props.characters.slice(0);
        
        characters.push(newCharacter);

        emit('charactersChanged', characters);
    }
}

function removeCharacter(characterId: string): void {
    const index = props.characters.findIndex((character) => character === characterId);

    if (index === -1) {
        return;
    }

    const characters = props.characters.slice(0);
    characters.splice(index, 1);

    emit('charactersChanged', characters);
}
</script>

<template>
    <raider-home>
        <div>
            <div class="add-character-wrapper">
                <AddCharacter
                    :existing-characters="characters"
                    @addedCharacter="addCharacterProfile"
                />
            </div>
        </div>

        <div>
            <MythicBestRunsPerCharacter
                :characters="characters"
                @removeCharacter="removeCharacter"
            />
        </div>
    </raider-home>
</template>

<style lang="scss">
raider-home {
    .add-character-wrapper {
        display: flex;
        justify-content: start;
        padding: 0.5em 0.5em 0.5em 0;
    }
}
</style>
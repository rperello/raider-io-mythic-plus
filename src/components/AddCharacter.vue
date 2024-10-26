<script setup>
import { inject, ref } from 'vue';
import { parseCharacter, serializeCharacter } from '../utils/character';

const emit = defineEmits(['addedCharacter']);
const character = defineModel('character', { type: String, default: '' });
const raiderApi = inject('raiderApi');
const verifyingCharacter = ref(null);
const isValid = ref(null);
const verificationMessage = ref(null);
const characterPattern = /^[a-z]+\/[a-z]+\/[a-z]+$/i;

const props = defineProps({
    existingCharacters: {
        type: Array,
        default: () => ([])
    }
});

async function addCharacter() {
    console.info('character', );
    verificationMessage.value = '';
    isValid.value = null;
    verifyingCharacter.value = character;

    const t = setTimeout(() => {
        if (verifyingCharacter.value != null) {
            verificationMessage.value = 'Verifying...';
        }
    }, 500);

    try {
        const parsedCharacter = parseCharacter(character.value);
        const profile = await raiderApi.getCharacterProfile(parsedCharacter);

        if ('error' in profile) {
            throw new Error(profile.message);
        }

        verificationMessage.value = null;
        isValid.value = true;

        emit('addedCharacter', profile);
        character.value = serializeCharacter({ region: profile.region, realm: profile.realm, name: '' });
    } catch (error) {
        verificationMessage.value = error.message;
        isValid.value = false;
    }

    clearTimeout(t);

    verifyingCharacter.value = null;
}
</script>

<template>
  <div style="position: relative; display: inline-flex; column-gap: 0.5rem;">
    <form @submit.prevent="addCharacter" style="display: inline-flex; column-gap: 0.5rem;">
        <input
            type="text"
            v-model="character"
            placeholder="region/realm/character_name"
            style="width: 200px;"
        >

        <button :disabled="character.length === 0 || !characterPattern.test(character) || existingCharacters.includes(character)">ADD</button>
    </form>

    <p
        v-if="verificationMessage != null"
        style="position: absolute; left: 100%; margin: 0; color: red; padding: 0.5em 1.2em; font-size: 1em; white-space: nowrap; font-weight: bold;"
        :style="{ color: isValid === false ? 'red' : 'inherit' }"
    >
        {{ verificationMessage }}
    </p>
  </div>
</template>
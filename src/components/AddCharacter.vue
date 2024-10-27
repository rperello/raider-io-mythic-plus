<script setup>
import { inject, computed, ref, watchEffect } from 'vue';
import { Character } from '../classes/character';

const props = defineProps({
    existingCharacters: {
        type: Array,
        default: () => ([])
    },
    region: {
        type: String,
        default: ''
    },
    realm: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['addedCharacter']);
const character = defineModel('character', { type: String, default: '' });
const raiderApi = inject('raiderApi');
const verifyingCharacter = ref(null);
const verifiedCharacter = ref(null);
const verificationMessage = ref(null);
const characterPattern = /^[a-z]+\/[a-z]+\/[a-z]+$/i;

const canAdd = computed(() => {
    return character.value.length > 0 && characterPattern.test(character.value) && !props.existingCharacters.includes(character.value)
});

watchEffect(() => {
    const { region, realm } = props;

    if (region && realm) {
        character.value = Character.serialize({ region, realm, name: '' });
    }
});

watchEffect(() => {
    if (character.value.length > 0 && characterPattern.test(character.value) && props.existingCharacters.includes(character.value)) {
        verificationMessage.value = 'Character already in your list';
    } else {
        verificationMessage.value = '';
    }
});

async function addCharacter() {
    verificationMessage.value = '';
    verifiedCharacter.value = null;
    verifyingCharacter.value = character;

    const t = setTimeout(() => {
        if (verifyingCharacter.value != null) {
            verificationMessage.value = 'Verifying...';
        }
    }, 500);

    const parsedCharacter = Character.parse(character.value);
    let profile;

    try {
        profile = await raiderApi.getCharacterProfile(parsedCharacter);

        if ('error' in profile) {
            throw new Error(profile.message);
        }

        verificationMessage.value = null;
        verifiedCharacter.value = true;
    } catch (error) {
        verificationMessage.value = error.message;
        verifiedCharacter.value = false;
    }

    clearTimeout(t);

    verifyingCharacter.value = null;

    if (verifiedCharacter.value) {
        emit('addedCharacter', profile);

        const { region, realm } = profile;

        character.value = Character.serialize({ region, realm, name: '' });
    }
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

        <button :disabled="!canAdd">Add</button>
    </form>

    <p
        v-if="verificationMessage != null"
        style="position: absolute; left: 100%; margin: 0; color: red; padding: 0.5em 1.2em; font-size: 1em; white-space: nowrap; font-weight: bold;"
        :class="{ 'verification-failed': verifiedCharacter === false }"
    >
        {{ verificationMessage }}
    </p>
  </div>
</template>

<style>
.verification-failed {
    color: orangered;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}
</style>
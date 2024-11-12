<script setup lang="ts">
import { inject, computed, ref, watchEffect } from 'vue';
import { Character } from '../classes/Character';
import { RaiderApi } from '../services/RaiderApi';
import { Persistence } from '../services/Persistence';

interface Props {
    existingCharacters: Array<string>;
}

const props = withDefaults(defineProps<Props>(), {
    existingCharacters: () => []
});

const emit = defineEmits(['addedCharacter']);
const character = defineModel('character', { type: String, default: '' });

const raiderApi = inject<RaiderApi>('raiderApi');
const persistence = inject<Persistence>('persistence');

if (persistence == null) {
    throw new Error('Persistence service is not defined');
}

const lastRegion = ref(persistence.getItem('last-region', ''));
const lastRealm = ref(persistence.getItem('last-realm', ''));

const verifyingCharacter = ref('');
const verifiedCharacter = ref<boolean | null>(null);
const verificationMessage = ref('');
const characterPattern = /^[a-z]+\/[a-z]+\/[a-z]+$/i;

const canAdd = computed(() => {
    return character.value.length > 0 && characterPattern.test(character.value) && !props.existingCharacters.includes(character.value)
});


watchEffect(() => {
    persistence.setItem('last-region', lastRegion.value);
    persistence.setItem('last-realm', lastRealm.value);

    if (lastRegion.value && lastRealm.value) {
        character.value = Character.stringify({ region: lastRegion.value, realm: lastRealm.value, name: '' });
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
    verifyingCharacter.value = character.value;

    const t = setTimeout(() => {
        if (verifyingCharacter.value != null) {
            verificationMessage.value = 'Verifying...';
        }
    }, 500);

    const parsedCharacter = Character.parse(character.value);
    let profile;

    if (raiderApi == null) {
        throw new Error('RaiderApi service is not defined');
    }

    try {
        profile = await raiderApi.getCharacterProfile(parsedCharacter);

        verificationMessage.value = '';
        verifiedCharacter.value = true;
    } catch (error: any) {
        verificationMessage.value = `Error fetching profile: ${error instanceof Error ? error.message : 'unknown error' }`;
        verifiedCharacter.value = false;
    }

    clearTimeout(t);

    verifyingCharacter.value = '';

    if (!verifiedCharacter.value || profile == null) {
        return
    }

    const { region, realm } = profile;
    
    lastRegion.value = region;
    lastRealm.value = realm;

    resetCharacterName();

    emit('addedCharacter', profile);
}

function resetCharacterName(): void {
    if (lastRegion.value && lastRealm.value) {
        character.value = Character.stringify({ region: lastRegion.value, realm: lastRealm.value, name: '' });
    }
}
</script>

<template>
    <!-- NOTE: Can not use `add-character` as it references to the default component exported by this file -->
    <raider-add-character>
        <form @submit.prevent="addCharacter">
            <input
                type="text"
                name="character-identifier"
                class="character-identifier"
                v-model="character"
                placeholder="region/realm/character_name"
            >

            <button :disabled="!canAdd">Add</button>
        </form>

        <p
            v-if="verificationMessage"
            :class="{ 'verification-failed': verifiedCharacter === false }"
        >
            {{ verificationMessage }}
        </p>
    </raider-add-character>
</template>

<style lang="scss">
raider-add-character {
    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;

    form {
        display: inline-flex;
        column-gap: 0.5rem;
    }

    .character-identifier {
        width: 200px;
    }

    .verification-message {
        position: relative;
        margin: 0;
        color: red;
        padding: 0.5em 1.2em;
        font-size: 1em;
        white-space: nowrap;
        font-weight: bold;

        &.verification-failed {
            color: orangered;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
        }
    }
}
</style>
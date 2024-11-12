<script setup lang="ts">
import { CharacterProfile } from '../types';
import CharacterBadge from './CharacterBadge.vue';

interface Props {
    provisionalCharacters: CharacterProfile[];
}

defineProps<Props>();
const emit = defineEmits(['removeCharacter', 'confirm']);
</script>

<template>
    <raider-provisional-characters>
        <div class="button-wrapper">
            <button
                :disabled="provisionalCharacters.length === 0"
                @click="emit('confirm')"
            >
                Confirm
            </button>
        </div>

        <raider-characters-list>
            <CharacterBadge
                v-for="character in provisionalCharacters"
                :character="character"
                enable-remove
                @removeCharacter="emit('removeCharacter', $event)"
            />
        </raider-characters-list>
    </raider-provisional-characters>
</template>

<style lang="scss">
raider-provisional-characters {
    display: inline-flex;
    align-items: stretch;
    flex-direction: column;
    row-gap: 0.5em;
    margin: 1em 0 2em;
    padding: 1em;
    background-color: #fff5;
    border-radius: 5px;

    .button-wrapper {
        text-align: right;
    }

    characters-list {
        display: inline-flex;
        flex-direction: column;
        row-gap: 2px;
    }
}
</style>
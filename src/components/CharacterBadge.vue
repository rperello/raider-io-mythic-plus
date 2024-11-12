<script setup lang="ts">
import { computed } from 'vue';
import { Character } from '../classes/Character';
import RemoveIcon from './RemoveIcon.vue';
import { Region } from '../types';

interface Props {
    character: {
        name: string;
        region: Lowercase<Region>;
        realm: string;
        class: string;
        thumbnail_url: string;
        profile_url: string;
    };
    enableRemove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    enableRemove: false
});

const emit = defineEmits(['removeCharacter']);

function removeCharacter(): void {
    emit('removeCharacter', id.value);
}

const id = computed(() => {
    return Character.stringify(props.character);
});
</script>

<template>
    <raider-character-badge
        :class="`${character.class.toLowerCase()}-class`"
    >
        <raider-character-profile>
            <img :src="character.thumbnail_url" :alt="character.name"/>

            <a
                :href="character.profile_url"
                target="_blank"
            >
                <strong>{{ character.name }}&nbsp;({{ character.realm }})</strong>
            </a>
        </raider-character-profile>

        <div
            v-if="enableRemove"
            class="remove-character"
            @click="removeCharacter"
        >
            <RemoveIcon/>
        </div>
    </raider-character-badge>
</template>

<style lang="scss">
raider-character-badge {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    column-gap: 8px;
    padding: 0.5em;
    width: 280px;

    &.warlock-class {
        color: #1a1a1a;
        background-color: #9482C9;
    }
    
    &.shaman-class {
        color: #1a1a1a;
        background-color: #0070DE;
    }
    
    &.hunter-class {
        color: #1a1a1a;
        background-color: #ABD473;
    }
    
    &.druid-class {
        color: #1a1a1a;
        background-color: #FF7D0A;
    }
    
    &.mage-class {
        color: #1a1a1a;
        background-color: #69CCF0;
    }
    
    &.priest-class {
        color: #1a1a1a;
        background-color: #FFFFFF;
    }
    
    &.paladin-class {
        color: #1a1a1a;
        background-color: pink;
    }

    raider-character-profile {
        display: flex;
        justify-content: start;
        align-items: center;
        column-gap: 8px;

        a {
            white-space: nowrap;
        }
        
        img {
            width: 42px;
        }
    }

    .remove-character {
        width: 42px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }
}
</style>
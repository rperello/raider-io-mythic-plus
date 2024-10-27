<script setup>
import RemoveIcon from './RemoveIcon.vue';

const emit = defineEmits(['removeCharacter']);

const props = defineProps({
    character: {
        type: Object,
        default: () => ({})
    },
    enableRemove: {
        type: Boolean,
        default: false
    }
});

function removeCharacter() {
    emit('removeCharacter', props.character.id);
}

</script>

<template>
    <div
        class="character-badge"
        :class="`${character.class.toLowerCase()}-class`"
    >
        <div class="character-badge-container">
            <img :src="character.thumbnail_url" :alt="character.name"/>

            <a
                :href="character.profile_url"
                target="_blank"
            >
                <strong>{{ character.name }}&nbsp;({{ character.realm }})</strong>
            </a>
        </div>

        <div
            v-if="enableRemove"
            class="character-badge-remove"
            @click="removeCharacter"
        >
            <RemoveIcon/>
        </div>
    </div>
</template>

<style>
.character-badge {
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

    .character-badge-container {
        display: flex;
        justify-content: start;
        align-items: center;
        column-gap: 8px;
    }

    .character-badge-remove {
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

    a {
        white-space: nowrap;
    }

    img {
        width: 42px;
    }
}
</style>
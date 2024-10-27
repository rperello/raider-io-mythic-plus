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
}

.character-badge.warlock-class {
    color: #1a1a1a;
    background-color: #9482C9;
}

.character-badge.shaman-class {
    color: #1a1a1a;
    background-color: #0070DE;
}

.character-badge.hunter-class {
    color: #1a1a1a;
    background-color: #ABD473;
}

.character-badge.druid-class {
    color: #1a1a1a;
    background-color: #FF7D0A;
}

.character-badge.mage-class {
    color: #1a1a1a;
    background-color: #69CCF0;
}

.character-badge.priest-class {
    color: #1a1a1a;
    background-color: #FFFFFF;
}

.character-badge.paladin-class {
    color: #1a1a1a;
    background-color: pink;
}

.character-badge .character-badge-container {
    display: flex;
    justify-content: start;
    align-items: center;
    column-gap: 8px;
}

.character-badge .character-badge-remove {
    width: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;
    cursor: pointer;
}

.character-badge .character-badge-remove:hover {
    opacity: 1;
}

.character-badge a {
    white-space: nowrap;
}

.character-badge img {
    width: 42px;
}
</style>
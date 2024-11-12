<script setup lang="ts">
// This starter template is using Vue 3 <script setup lang="ts"> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { inject, reactive, watchEffect } from 'vue'
import { Character } from './classes/Character';
import AddCharacters from './AddCharacters.vue';
import { CharacterProfile } from './types';
import { Persistence } from './services/Persistence';
import Home from './Home.vue';

const persistence = inject<Persistence>('persistence');

if (persistence == null) {
    throw new Error('Persistence is not defined');
}

const data = reactive({
    characters: persistence.getItem<Array<string>>('characters', [])
});


watchEffect(() => {
    persistence.setItem('characters', data.characters);
});

function addedNewCharacters(characterProfiles: CharacterProfile[]): void {
    const newCharacters = [];

    for (const characterProfile of characterProfiles) {
        const character = Character.stringify(characterProfile);
    
        newCharacters.push(character);
    }

    setCharacters([...data.characters, ...newCharacters]);
}

function setCharacters(characters: Array<string>): void {
    data.characters = characters;
    persistence!.setItem('characters', characters);
}
</script>

<template>
    <header>
        <img
            src="/Logo_TheWarWithin.avif"
            class="logo"
            alt="The War Within official logo"
        >
    </header>

    <main>
        <h1 class="orange-glow">
            Best mythic dungeon runs &amp; score
        </h1>

        <Home
            v-if="data.characters.length"
            :characters="data.characters"
            @charactersChanged="setCharacters"
        />

        <AddCharacters
            v-else
            :characters="data.characters"
            @addedNewCharacters="addedNewCharacters"
        />
    </main>
</template>

<style lang="scss">
header {
  height: 85px;
}

.logo {
    padding: 1.5em;
    width: 180px;
    filter: drop-shadow(0 0 2em #eb872380);
}
</style>

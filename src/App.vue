<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import MythicBestRunsPerCharacter from './components/MythicBestRunsPerCharacter.vue';
import { ref } from 'vue'
import { useMythicBestRunsPerCharacter } from './hooks/useMythicBestRunsPerCharacter';

const characters = ref([
  'eu/dunmodr/Iomara',
  'eu/dunmodr/Naroa',
  'eu/dunmodr/Aunara',
  'eu/dunmodr/Ciomara',
  'eu/dunmodr/Naroua',
  'eu/dunmodr/Siomara'
]);

const { characterExtendedData, mythicBestRunsPerCharacter } = useMythicBestRunsPerCharacter(characters);
</script>

<template>
    <h1 style="text-align: center; font-size: 2rem; margin-bottom: 4rem;">Raider IO best mythic dungeon runs</h1>

    <div v-if="characters.length">
        <MythicBestRunsPerCharacter
            v-if="mythicBestRunsPerCharacter != null"
            :mythic-best-runs-per-character="mythicBestRunsPerCharacter"
            :characters="characterExtendedData"
        />
    </div>

    <div v-else>No characters. Please, add one</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

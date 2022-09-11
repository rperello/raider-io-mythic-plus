<script setup>
const props = defineProps({
    mythicBestRuns: {
        type: Object,
        default: () => ({})
    }
});
</script>

<template>
    <div v-if="mythicBestRuns != null">
        <table aria-describedby="Best run per mythic dungeon">
            <thead>
                <tr>
                    <th class="text-left">Mythic Dungeon</th>
                    <th>Character</th>
                    <!-- <th>Realm</th> -->
                    <!-- <th>Region</th> -->
                    <th>Best level</th>
                    <th class="text-left">Completed at</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(run, dungeon) in mythicBestRuns"
                :key="dungeon">
                    <td class="text-left"><strong>{{ dungeon }}</strong></td>
                    <td>{{ run.name }} ({{ run.realm }})</td>
                    <!-- <td>{{ run.realm }}</td> -->
                    <!-- <td>{{ run.region }}</td> -->
                    <td>{{ run.best_level }}</td>
                    <td class="text-left">{{ run.completed_at }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

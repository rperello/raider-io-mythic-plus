<script setup>
import { ref } from 'vue';

const emit = defineEmits(['importedCharacters']);

const importingErrorMessages = ref([]);
const supportedExtensions = ['txt', 'json'];

async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        let content = '';

        reader.onload = (event) => {
            content += event.target.result;
        };

        reader.onloadend = (event) => {
            resolve(content);
        };

        reader.onerror = (event) => {
            console.log('event', event);
            reject(new Error('Error reading file'));
        }

        reader.readAsText(file);
    });
}

function getFileExtension(file) {
    return file.name.split('.').at(-1).toLowerCase();
}

async function processFile(event) {
    importingErrorMessages.value = [];

    const { files } = event.dataTransfer;

    if (files.length === 0) {
        importingErrorMessages.value = ['No files imported'];
        return;
    }

    const [file] = files;
    const extension = getFileExtension(file);

    if (!supportedExtensions.includes(extension)) {
        importingErrorMessages.value = [`Unsupported extension ${extension}`, `Only supported ${supportedExtension.join(', ')}`];
        return;
    }

    let content;

    try {
        content = await readFile(file);
    } catch (error) {
        console.error(error);
        importingErrorMessages.value = [`Could not read file ${file.name}`];
        return;
    }

    let importedCharacters;

    try {
        switch (extension) {
            case 'json':
                importedCharacters = JSON.parse(content);
                break;
            case 'csv':
            case 'txt':
                importedCharacters = content.split('\n');
                break;
            default:
        }
    } catch (error) {
        console.error(error);
        importingErrorMessages.value = [`Could not process the file ${file.name}`, error.message];
    }

    if (!importedCharacters) {
        return;
    }

    emit('importedCharacters', importedCharacters);
}
</script>

<template>
    <div
        class="import-drop-zone"
        draggable
        @drop.prevent="processFile"
        @dragstart.prevent
        @dragover.prevent
        @dragenter.prevent
    >
        <p>Import only one file with all your characters<br>(supported {{ supportedExtensions.join(', ') }} extensions)</p>

        <div v-if="importingErrorMessages.length > 0">
            <p
                v-for="importingErrorMessage of importingErrorMessages"
                class="orange-glow"
                style="margin: 0.2em 0;"
            >
                {{ importingErrorMessage }}
            </p>
        </div>
    </div>
</template>

<style>
.import-drop-zone {
    min-width: 300px;
    border: 4px dashed;
    border-radius: 12px;
    aspect-ratio: 16/9;
    display: grid;
    place-items: center;
    padding: 1em;
}

.import-drop-zone:hover {
    background-color: rgba(0, 0, 0, 0.4);
}
</style>
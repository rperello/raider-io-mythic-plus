<script setup lang="ts">
import { ref } from 'vue';

type Characters = Array<string>;

const emit = defineEmits(['importedCharacters']);

const importingErrorMessages = ref<Array<string>>([]);
const supportedExtensions = ['txt', 'json'];

async function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        let content = '';

        reader.onload = (event) => {
            if (event.target == null) {
                return;
            }

            content += event.target.result;
        };

        reader.onloadend = () => {
            resolve(content);
        };

        reader.onerror = (event) => {
            console.log('event', event);
            reject(new Error('Error reading file'));
        }

        reader.readAsText(file);
    });
}

function getFileExtension(file: File): string {
    const last = file.name.split('.').at(-1);

    if (last == null) {
        return '';
    }

    return last.toLowerCase();
}

async function processFile(event: DragEvent): Promise<void> {
    importingErrorMessages.value = [];

    if (event.dataTransfer == null) {
        return;
    }

    const { files } = event.dataTransfer;

    if (files.length === 0) {
        importingErrorMessages.value = ['No files imported'];
        return;
    }

    const [file] = files;
    const extension = getFileExtension(file);

    if (!supportedExtensions.includes(extension)) {
        importingErrorMessages.value = [
            `Unsupported extension ${extension}`,
            `Only supported ${supportedExtensions.join(', ')}`
        ];

        return;
    }

    readCharacters(file).then((characters: Characters) => {
        emit('importedCharacters', characters);
    }).catch((error: Error) => {
        importingErrorMessages.value = [error.message];
    });
}

async function readCharacters(file: File): Promise<Characters> {
    let content;

    try {
        content = await readFile(file);
    } catch (error) {
        throw new Error(`Could not read file ${file.name}`, { cause: error });
    }

    const extension = getFileExtension(file);

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
        throw new Error(`Could not process the file ${file.name}`, { cause: error });
    }

    if (!importedCharacters) {
        throw new Error(`No characters found in file`);
    }

    return importedCharacters;
}
</script>

<template>
    <raider-import-drop-zone
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
    </raider-import-drop-zone>
</template>

<style lang="scss">
raider-import-drop-zone {
    min-width: 300px;
    border: 4px dashed;
    border-radius: 12px;
    aspect-ratio: 16/9;
    display: grid;
    place-items: center;
    padding: 1em;

    &:hover {
        background-color: rgba(0, 0, 0, 0.4);
    }
}
</style>
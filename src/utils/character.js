export function parseCharacter(character) {
    const [region, realm, name] = character.split('/');

    return {
        region,
        realm,
        name
    };
}

export function serializeCharacter({ region, realm, name }) {
    return `${region}/${realm.replace(/\s/, '').toLowerCase()}/${name}`;
}

export class Character {
    static parse(character) {
        const [region, realm, name] = character.split('/');

        return {
            region,
            realm,
            name
        };
    }


    static serialize({ region, realm, name }) {
        return `${region}/${realm?.replace(/\s/, '').toLowerCase()}/${name}`;
    }
}

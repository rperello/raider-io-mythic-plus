export class Character {
    public static parse(character: string): { region: string; realm: string; name: string; } {
        const [region, realm, name] = character.split('/');

        return {
            region,
            realm,
            name
        };
    }


    public static stringify({ region, realm, name }: { region: string; realm: string; name: string}) {
        return `${region}/${realm?.replace(/\s/, '').toLowerCase()}/${name}`;
    }
}

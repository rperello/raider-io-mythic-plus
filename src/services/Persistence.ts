export class Persistence {
    public getItem<T>(key: string, defaultValue: T): T {
        const textValue = localStorage.getItem(key);

        if (textValue == null) {
            return defaultValue;
        }

        return JSON.parse(textValue);
    }

    public setItem(key: string, value: unknown): void {
        const textValue = JSON.stringify(value);
    
        localStorage.setItem(key, textValue);
    }
}

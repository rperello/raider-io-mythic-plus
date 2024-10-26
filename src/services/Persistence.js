export class Persistence {
    getItem(key, defaultValue) {
        const textValue = localStorage.getItem(key);

        if (textValue == null) {
            return defaultValue;
        }

        try {
            return JSON.parse(textValue);
        } catch (error) {
            return defaultValue;
        }
    }

    setItem(key, value) {
        const textValue = JSON.stringify(value);
    
        localStorage.setItem(key, textValue);
    }
}
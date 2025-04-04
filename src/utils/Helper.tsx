// ---------- Helper Functions ----------
class Helper {
    static globalMessageId = 1;

    static getNextId(): number {
        return this.globalMessageId++;
    }

    static getRandomEgyptPhoneNumber(): string {
        const prefixes = ['010', '011', '012', '015'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let rest = '';
        for (let i = 0; i < 8; i++) {
            rest += Math.floor(Math.random() * 10);
        }
        return prefix + rest;
    }
}

export default Helper;

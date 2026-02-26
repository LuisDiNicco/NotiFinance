export class CountryRisk {
    public readonly value: number;
    public readonly changePct: number;
    public readonly timestamp: Date;

    constructor(value: number, changePct: number, timestamp: Date) {
        this.value = value;
        this.changePct = changePct;
        this.timestamp = timestamp;
    }
}

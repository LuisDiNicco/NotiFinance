export class Portfolio {
    public id?: string;
    public readonly userId: string;
    public readonly name: string;
    public readonly description: string | null;

    constructor(params: {
        userId: string;
        name: string;
        description?: string | null;
    }) {
        this.userId = params.userId;
        this.name = params.name;
        this.description = params.description ?? null;
    }
}

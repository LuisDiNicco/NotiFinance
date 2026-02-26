export class WatchlistItem {
    public id?: string;
    public readonly userId: string;
    public readonly assetId: string;
    public readonly createdAt: Date | undefined;

    constructor(params: {
        userId: string;
        assetId: string;
        createdAt?: Date;
    }) {
        this.userId = params.userId;
        this.assetId = params.assetId;
        this.createdAt = params.createdAt;
    }
}

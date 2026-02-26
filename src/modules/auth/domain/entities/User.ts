export class User {
    public id?: string;
    public readonly email: string;
    public readonly passwordHash: string;
    public readonly displayName: string;
    public readonly isDemo: boolean;
    public readonly createdAt?: Date;

    constructor(
        email: string,
        passwordHash: string,
        displayName: string,
        isDemo: boolean,
    ) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.isDemo = isDemo;
    }
}

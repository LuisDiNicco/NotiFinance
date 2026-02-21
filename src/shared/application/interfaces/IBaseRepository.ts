export interface IBaseRepository<T> {
    save(entity: T): Promise<T>;
    findById(id: string): Promise<T | null>;
    delete(id: string): Promise<void>;
}

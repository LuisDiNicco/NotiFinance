import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const sourceRoot = join(process.cwd(), 'src', 'modules');

function collectTypeScriptFiles(path: string): string[] {
    const entries = readdirSync(path);

    return entries.flatMap((entry) => {
        const fullPath = join(path, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            return collectTypeScriptFiles(fullPath);
        }

        if (entry.endsWith('.ts')) {
            return [fullPath];
        }

        return [];
    });
}

describe('Clean Architecture constraints', () => {
    const files = collectTypeScriptFiles(sourceRoot);

    it('domain layer has no NestJS/TypeORM/framework dependencies', () => {
        const domainFiles = files.filter((filePath) =>
            relative(sourceRoot, filePath).includes(`${'domain'}`),
        );

        for (const filePath of domainFiles) {
            const content = readFileSync(filePath, 'utf8');

            expect(content).not.toMatch(/from '@nestjs\//);
            expect(content).not.toMatch(/from 'typeorm'/);
            expect(content).not.toMatch(/from 'axios'/);
            expect(content).not.toMatch(/from .*infrastructure\//);
            expect(content).not.toMatch(/from .*application\//);
        }
    });

    it('application layer does not depend on infrastructure', () => {
        const applicationFiles = files.filter((filePath) =>
            relative(sourceRoot, filePath).includes(`${'application'}`),
        );

        for (const filePath of applicationFiles) {
            const content = readFileSync(filePath, 'utf8');
            expect(content).not.toMatch(/from .*modules\/.+\/infrastructure\//);
        }
    });

    it('contains expected core modules for current backend phases', () => {
        const expectedModules = [
            'auth',
            'ingestion',
            'market-data',
            'alert',
            'notification',
            'preferences',
            'template',
            'portfolio',
            'watchlist',
        ];

        for (const moduleName of expectedModules) {
            const modulePath = join(sourceRoot, moduleName);
            expect(existsSync(modulePath)).toBe(true);
        }
    });
});

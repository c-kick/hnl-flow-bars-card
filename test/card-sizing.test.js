import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/hnl-flow-bars-card.js', import.meta.url), 'utf8');

describe('card sizing css contract', () => {
    it('keeps rendered content in normal flow so masonry can derive height', () => {
        const cardContentRule = source.match(/\n\s{12}\.card-content\s*\{[^}]+\}/)?.[0];

        expect(cardContentRule).toBeDefined();
        expect(cardContentRule).not.toContain('position: absolute;');
        expect(cardContentRule).not.toContain('inset: 0;');
        expect(cardContentRule).toContain('min-height: inherit;');
    });
});

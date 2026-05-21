import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const scaffoldingPath = new URL('../src/scaffolding.js', import.meta.url);
const stylesPath = new URL('../src/styles.js', import.meta.url);

describe('css module split', () => {
    it('has separate scaffolding and visual style modules', () => {
        expect(existsSync(scaffoldingPath)).toBe(true);
        expect(existsSync(stylesPath)).toBe(true);
    });

    it('keeps presentational debugging css out of production modules', () => {
        const sources = [
            readFileSync(scaffoldingPath, 'utf8'),
            readFileSync(stylesPath, 'utf8'),
        ].join('\n');

        expect(sources).not.toContain('PRESENTATIONAL DEBUGGING STYLES');
        expect(sources).not.toContain('outline: 1px solid blue');
        expect(sources).not.toContain('outline: 1px solid green');
        expect(sources).not.toContain('width: 600px');
        expect(sources).not.toContain('height: 150px');
        expect(sources).not.toContain('margin: 0 auto');
    });

    it('places core layout selectors in scaffolding', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('export const hnlFlowBarsCardScaffolding');
        expect(source).toContain('hnl-flow-bars');
        expect(source).toContain('hnl-flow-bar-source-group');
        expect(source).toContain('hnl-flow-bar-source-accolades');
        expect(source).toContain('hnl-flow-bar-destination-group');
        expect(source).toContain('min-width: min-content');
        expect(source).toContain('text-overflow: ellipsis');
    });

    it('places visual selectors in styles', () => {
        const source = readFileSync(stylesPath, 'utf8');

        expect(source).toContain('export const hnlFlowBarsCardStyles');
        expect(source).toContain('--hnl-flow-bars-color-production');
        expect(source).toContain('--hnl-flow-bars-color-consumption');
        expect(source).toContain('@keyframes stripe-scroll-left-3');
        expect(source).toContain('repeating-linear-gradient');
    });
});

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

    it('places blueprint scaffolding selectors in scaffolding', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('export const hnlFlowBarsCardScaffolding');
        expect(source).toContain('hnl-flow-bars-card-source-group');
        expect(source).toContain('hnl-flow-bars-card-accolade-group');
        expect(source).toContain('hnl-flow-bars-card-destination-group');
        expect(source).toContain('hnl-flow-bars-card-source-label');
        expect(source).toContain('hnl-flow-bars-card-source-accolade');
        expect(source).toContain('hnl-flow-bars-card-destination');
        expect(source).toContain('hnl-flow-bars-card-destination-label');
        expect(source).toContain('.hnl-flow-bars-card-value-pill');
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

    it('uses namespaced layout and theme selectors for visual variants', () => {
        const source = readFileSync(stylesPath, 'utf8');

        expect(source).toContain('hnl-flow-bars.layout-native {');
        expect(source).toContain('hnl-flow-bars.layout-native.theme-split-pill {');
        expect(source).toContain('hnl-flow-bars.layout-native.theme-minimal {');
        expect(source).toContain('hnl-flow-bars.layout-native.theme-contained hnl-flow-bars-card-source-group');
        expect(source).toContain('hnl-flow-bars.layout-native.gradient hnl-flow-bars-card-source-label');
        expect(source).toContain('hnl-flow-bars.no-slant:not(.layout-native) hnl-flow-bars-card-source-label > div');
        expect(source).toContain('hnl-flow-bars.layout-accolade hnl-flow-bars-card-source-label {');
        expect(source).toContain('hnl-flow-bars.layout-accolade hnl-flow-bars-card-source-accolade {');
        expect(source).toContain('hnl-flow-bars.layout-accolade hnl-flow-bars-card-destination {');
        expect(source).toContain('hnl-flow-bars.layout-accolade hnl-flow-bars-card-destination-label {');
        expect(source).toMatch(/\n\s{4}hnl-flow-bars-card-source-label > div\s*\{[^}]*--adjusted-bg-color:/);
        expect(source).toMatch(/\n\s{4}hnl-flow-bars-card-destination\s*\{[^}]*--adjusted-bg-color:/);
        expect(source).toMatch(/\n\s{4}hnl-flow-bars-card-destination-label\s*\{[^}]*--span-bg-color:/);

        expect(source).not.toContain('hnl-flow-bars.native');
        expect(source).not.toContain('.alternative');
        expect(source).not.toContain('.contained');
        expect(source).not.toContain('.minimal');

        expect(source).not.toMatch(/\n\s{4}hnl-flow-bars-card-source-label\s*\{/);
        expect(source).not.toMatch(/\n\s{4}hnl-flow-bars-card-source-accolade\s*\{/);
    });

    it('implements blueprint label fitting without presentational demo css', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('flex-basis: var(--width-value, auto)');
        expect(source).toContain('max-width: var(--width-value, auto)');
        expect(source).toContain('min-width: min-content');
        expect(source).toContain('width: 0');
        expect(source).toContain('min-width: 100%');
        expect(source).toContain('ha-card.clip-labels hnl-flow-bars-card-source-label');
        expect(source).toContain('ha-card.clip-labels hnl-flow-bars-card-destination');
        expect(source).not.toContain('outline-offset');
        expect(source).not.toContain('background-color: #F006');
    });

    it('lets remainder segments fill leftover row space instead of constraining layout to width value', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        const remainderRule = source.match(/hnl-flow-bars hnl-flow-bars-card-source-group \.hnl-flow-bars-card-remainder,[\s\S]+?max-width: none;\n\s{4}\}/)?.[0];

        expect(remainderRule).toBeDefined();
        expect(remainderRule).toContain('flex-basis: auto;');
        expect(remainderRule).toContain('max-width: none;');
        expect(remainderRule).not.toContain('var(--width-value');
    });

    it('bridges the icon-size hook onto ha-icon\'s --mdc-icon-size API', () => {
        const source = readFileSync(stylesPath, 'utf8');

        // --hnl-flow-bars-icon-size is the public hook, but ha-icon only
        // listens to --mdc-icon-size; without this bridge icons render at
        // ha-icon's 24px default (regression shipped in v1.9.0).
        expect(source).toContain('--hnl-flow-bars-icon-size:');
        expect(source).toMatch(/ha-icon\s*\{[^}]*--mdc-icon-size:\s*var\(--hnl-flow-bars-icon-size\)/);
    });

    it('groups are siblings in the root grid, not nested', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        // Each group is placed in its own grid row from the root
        expect(source).toMatch(/hnl-flow-bars-card-source-group\s*\{[^}]*grid-row:\s*1\s*\/\s*2/);
        expect(source).toMatch(/hnl-flow-bars-card-accolade-group\s*\{[^}]*grid-row:\s*2\s*\/\s*4/);
        expect(source).toMatch(/hnl-flow-bars-card-destination-group\s*\{[^}]*grid-row:\s*3\s*\/\s*4/);
    });
});

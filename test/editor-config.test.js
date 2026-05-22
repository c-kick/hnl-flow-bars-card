import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const editorSource = readFileSync(
    new URL('../src/editor/hnl-flow-bars-card-editor.js', import.meta.url),
    'utf8',
);

describe('editor config preservation', () => {
    it('preserves advanced css_vars when saving unrelated editor fields', () => {
        expect(editorSource).toContain('const config = { ...this._config };');
        expect(editorSource).not.toContain('delete config.css_vars');
    });
});

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

    it('keeps show_icons enabled by default and omits it unless disabled', () => {
        expect(editorSource).toContain('Show icons');
        expect(editorSource).toContain('.checked=${this._config.show_icons ?? true}');
        expect(editorSource).toContain("if (config.show_icons ?? true) delete config.show_icons;");
    });
});

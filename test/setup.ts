import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
    // Every element in jsdom measures 0x0, and MUI's Popover reads that as a detached
    // anchor and logs a warning on every open. Give elements a size so the tests stay
    // readable; nothing here asserts on geometry.
    Element.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
        return {
            width: 300,
            height: 32,
            top: 0,
            left: 0,
            bottom: 32,
            right: 300,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect;
    };
});

afterEach(() => {
    cleanup();
});

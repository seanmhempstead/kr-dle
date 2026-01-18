import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

describe('App', () => {
    beforeEach(() => {
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the app', () => {
        render(<App />);
        // Basic check to see if the app renders without crashing
        // You might want to look for specific text or elements present in your App
        const appElement = document.body;
        expect(appElement).toBeInTheDocument();
    });
});

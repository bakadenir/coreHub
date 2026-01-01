import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
    it('combines multiple class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles undefined and null values', () => {
        expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe('btn btn-active');
    });

    it('handles empty strings', () => {
        expect(cn('foo', '', 'bar')).toBe('foo bar');
    });

    it('merges conflicting Tailwind classes correctly', () => {
        // twMerge should keep the last conflicting class
        expect(cn('px-2', 'px-4')).toBe('px-4');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles arrays of class names', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('handles objects with boolean values', () => {
        expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('handles mixed inputs', () => {
        expect(cn('base', ['array-class'], { 'object-class': true })).toBe('base array-class object-class');
    });
});

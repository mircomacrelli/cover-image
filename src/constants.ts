import {CoverImageSettings} from './CoverImageSettings';


export const IMAGE_TYPES: Set<string> = new Set<string>([
    'avif',
    'bmp',
    'gif',
    'jpeg',
    'jpg',
    'png',
    'svg',
    'webp'
]);

export const SELECTORS: Map<string, string> = new Map<string, string>([
    ['preview', '.markdown-preview-view'],
    ['source', '.cm-sizer']
]);

export const COVER_CONTAINER = 'cover-container';

export const DEFAULT_SETTINGS: CoverImageSettings = {
    propertyName: 'cover'
};
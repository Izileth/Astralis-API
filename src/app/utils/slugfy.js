"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
function slugify(text) {
    const slug = text
        .toString()
        .normalize('NFD') // The NFD Unicode form decomposes combined graphemes into the base character and the accent.
        .replace(/[\u0300-\u036f]/g, '') // Remove all accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric, non-space, non-hyphen characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
    // Remove leading and trailing hyphens
    return slug.replace(/^-+|-+$/g, '');
}

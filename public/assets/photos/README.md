# FLUIVIX generated photography

These original photorealistic images were created with the built-in ImageGen tool for this demonstration. They do not document actual merchandise or real FLUIVIX campaigns. No existing brand photography was copied.

- `campaign-hero.webp`: homepage campaign photograph.
- `campaign-hero-wide.webp`: 1983 × 793 (~2.5:1) AI-expanded homepage desktop variant; the original campaign image remains the phone/tablet source and is preserved for other sections. Both sources are served locally through a responsive picture element.
- `collection-*.webp`: editorial collection, discovery and lookbook images.
- `about-atelier.webp`: brand-story section photograph.
- `p-NNN-ink.webp`, `p-NNN-sand.webp`, `p-NNN-olive.webp`: individual catalog product/color photographs. Single-color accessories use `ink`.
- `PROMPTS.json`: exact generation prompts, keyed by final asset filename.

PNG originals remain in Codex's generated-images directory. Project assets are encoded as WebP at quality 84, without cropping, recoloring or semantic modification. `scripts/encode-photo-assets.mjs` consumes a local manifest with `{id, source, prompt}` entries. All displayed images are served locally; the storefront does not call an image or translation service.

Original SVG illustrations remain under `public/assets/` for existing historical order snapshots and graceful fallback. Current product and section imagery uses these generated photographs.

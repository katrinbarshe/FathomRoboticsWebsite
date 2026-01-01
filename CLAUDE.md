# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Fathom Robotics marketing website - a static site showcasing marine robotics products (CANaBUS Maximus, CANaBUS Mini, E-STOP Receiver). The site features an interactive SVG-based boat illustration on the homepage with clickable components that open product modals.

## Architecture

### Site Structure

The site uses a **static HTML architecture with client-side fragment loading** rather than a traditional build system:

- **Root redirect**: [index.html](index.html) at the project root redirects to `./static/index.html`
- **Main site**: All actual content lives in [static/](static/)
- **Pages**: Individual HTML files for homepage ([static/index.html](static/index.html)) and product pages ([static/canabus-maximus.html](static/canabus-maximus.html), [static/canabus-mini.html](static/canabus-mini.html), [static/e-stop.html](static/e-stop.html))
- **Shared components**: [static/header.html](static/header.html) and [static/footer.html](static/footer.html) are loaded dynamically via `loadFragment()` function
- **Assets**: Images in [static/images/](static/images/), CSS in [static/css/main.css](static/css/main.css), JavaScript in [static/js/](static/js/)

### JavaScript Architecture

Two main JavaScript files provide core functionality:

**[static/js/includes.js](static/js/includes.js)**: Utility functions for fragment loading and page initialization
- `loadFragment(url, targetId)` - Fetches HTML fragments (header/footer) and injects them into page
- `loadScript(src)` - Dynamically loads JavaScript files
- `initHeaderNav()` - Sets up mobile navigation toggle
- `setYear()` - Updates copyright year in footer

**[static/js/main.js](static/js/main.js)**: Homepage-specific interactive SVG boat functionality
- Manages responsive SVG loading (different files for desktop/tablet/mobile breakpoints)
- `SVG_SOURCES` - Maps breakpoints to SVG file paths (currently references non-existent `assets/svg/` files)
- `HOTSPOTS` - Configures interactive tooltips for SVG elements (currently empty)
- `MODAL_TARGETS` - Maps SVG element IDs to product modals (e.g., "canabas-maximus" opens product details)
- `setupSvgModals()` - Binds click handlers to SVG elements to open overlay modals
- Tooltip system tracks pointer and displays on hover
- Modal system with overlay (`#svgModalOverlay`) and ESC key support

### Page Initialization Pattern

All pages follow this initialization pattern:

```javascript
(async () => {
  await loadFragment("header.html", "site-header");
  await loadFragment("footer.html", "site-footer");
  initHeaderNav();
  setYear();
  // Page-specific initialization (e.g., main.js for homepage)
})();
```

### Styling System

[static/css/main.css](static/css/main.css) uses CSS custom properties for a design system:

- **Fluid typography**: `--step--1` through `--step-3` using `clamp()` for responsive text sizing
- **Color system**: `--bg`, `--panel`, `--text`, `--muted`, `--line`, `--accent`
- **Spacing scale**: `--space-1` through `--space-4` using `clamp()` for responsive spacing
- **Component classes**: `.text-title-lg`, `.text-title-xl`, `.text-body`, `.card`, `.btn`, etc.
- **Product hero sections**: Use CSS custom property `--hero-bg` for background images

### Important Implementation Details

1. **SVG Loading Issue**: [static/js/main.js](static/js/main.js) references `assets/svg/` directory that doesn't exist. The homepage currently has an inline SVG embedded directly in [static/index.html](static/index.html). The `setupSvgModals()` function is called on both the inline SVG and dynamically loaded SVGs.

2. **Fragment Loading**: Header and footer are loaded via `fetch()` calls on every page load (with `cache: "no-cache"`), not pre-compiled or server-side rendered.

3. **Product Pages**: Each product page ([canabus-maximus.html](static/canabus-maximus.html), [canabus-mini.html](static/canabus-mini.html), [e-stop.html](static/e-stop.html)) has:
   - Product hero section with background image via inline style
   - Detailed product specifications and descriptions
   - Same header/footer loading pattern as homepage

4. **Modal System**: The homepage contains modal markup in [static/index.html](static/index.html) that gets opened when clicking SVG elements with IDs matching `MODAL_TARGETS` in [static/js/main.js](static/js/main.js).

## Development Workflow

### Local Development

This is a static site with no build step. To develop:

1. Serve the [static/](static/) directory with any HTTP server
2. Common options:
   ```bash
   # Python 3
   cd static && python3 -m http.server 8000

   # Node.js (npx)
   cd static && npx http-server -p 8000

   # VS Code Live Server extension (right-click static/index.html)
   ```

3. Navigate to `http://localhost:8000/` or `http://localhost:8000/index.html`

### Deployment

Deploy the entire repository to any static hosting provider (GitHub Pages, Netlify, Vercel, etc.). The root [index.html](index.html) redirect will send users to [static/index.html](static/index.html).

### Making Changes

**To add/edit pages:**
- Create new HTML files in [static/](static/)
- Include the fragment loading script pattern
- Reference [static/css/main.css](static/css/main.css) in `<head>`
- Add navigation links to [static/header.html](static/header.html)

**To modify global header/navigation:**
- Edit [static/header.html](static/header.html)
- Changes apply to all pages on next load

**To modify global footer:**
- Edit [static/footer.html](static/footer.html)

**To edit interactive SVG on homepage:**
- Modify inline SVG in [static/index.html](static/index.html), OR
- Add SVG files to a new `assets/svg/` directory and update `SVG_SOURCES` in [static/js/main.js](static/js/main.js)
- Configure hotspots/interactivity by editing `HOTSPOTS` and `MODAL_TARGETS` in [static/js/main.js](static/js/main.js)

**To update styles:**
- Edit [static/css/main.css](static/css/main.css)
- Use existing CSS custom properties (`--step-*`, `--space-*`, etc.) for consistency

## Key Constraints

- **No build process**: This is intentional - the site is pure HTML/CSS/JS with no transpilation, bundling, or preprocessing
- **Client-side routing**: All navigation is via standard `<a href>` links, no SPA framework
- **Fragment loading**: Header/footer are loaded client-side, not server-rendered
- **Git-based deployment**: No CI/CD configuration present - deploy by pushing to hosting provider's git remote

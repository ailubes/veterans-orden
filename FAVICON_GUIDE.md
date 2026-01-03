# Favicon Generation Guide

## Current Status

✅ Favicon files exist in `/public/` (from template)
✅ Favicon metadata configured in `src/app/layout.tsx`
⚠️ Using placeholder favicons - need to regenerate with Order of Veterans logo

## Files to Generate

Using the logo at `/public/images/logo-veterans-orden.png`, generate:

### Required Files:
- `favicon.ico` (16x16, 32x32, 48x48 multi-size)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### Optional (Windows tiles):
- `mstile-70x70.png`
- `mstile-144x144.png`
- `mstile-150x150.png`
- `mstile-310x150.png`
- `mstile-310x310.png`

## How to Generate

### Option 1: Online Tool (Recommended)
1. Visit: https://realfavicongenerator.net/
2. Upload `/public/images/logo-veterans-orden.png`
3. Configure options:
   - iOS: Use plain logo, no background
   - Android: Use plain logo
   - Windows: Use accent color `#d45d3a` (timber accent)
   - macOS Safari: No pinned tab icon needed
4. Generate and download
5. Extract files to `/public/`
6. Update `site.webmanifest` if needed

### Option 2: Manual with ImageMagick
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Generate favicons
convert public/images/logo-veterans-orden.png -resize 16x16 public/favicon-16x16.png
convert public/images/logo-veterans-orden.png -resize 32x32 public/favicon-32x32.png
convert public/images/logo-veterans-orden.png -resize 180x180 public/apple-touch-icon.png
convert public/images/logo-veterans-orden.png -resize 192x192 public/android-chrome-192x192.png
convert public/images/logo-veterans-orden.png -resize 512x512 public/android-chrome-512x512.png

# Generate .ico (multi-size)
convert public/images/logo-veterans-orden.png -resize 16x16 \
        public/images/logo-veterans-orden.png -resize 32x32 \
        public/images/logo-veterans-orden.png -resize 48x48 \
        public/favicon.ico
```

## Verification

After generating, verify:
- [ ] Files appear in `/public/`
- [ ] Icons display correctly in browser tab
- [ ] iOS home screen icon looks good
- [ ] Android home screen icon looks good

## site.webmanifest

Update `/public/site.webmanifest`:
```json
{
  "name": "Орден Ветеранів",
  "short_name": "Орден",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#f5f1e8",
  "display": "standalone"
}
```

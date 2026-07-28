# GPS Enigma Countdown Website

This is a self-contained countdown website. When the target date is reached, it automatically displays a six-step GPS coordinate puzzle.

## Files

- `index.html`: page structure
- `styles.css`: responsive dark theme
- `script.js`: countdown logic, puzzle content, local storage
- `README.md`: setup instructions

## Set the public countdown date

Open `script.js` and replace:

```js
const DEFAULT_RELEASE_DATE = "2026-08-15T18:00:00+02:00";
```

Use an ISO date including the time-zone offset.

Examples:

```js
// Paris summer time
"2026-08-15T18:00:00+02:00"

// Paris winter time
"2026-12-15T18:00:00+01:00"
```

The floating **Setup** button can also change the date in the current browser. This is useful for testing. It stores the chosen date in `localStorage`.

For a public website, the date in `script.js` is the default seen by new visitors.

## Add your enigmas

In `script.js`, edit the six objects inside `ENIGMAS`.

Example:

```js
{
  number: 1,
  target: "Latitude degrees",
  title: "Enigma 1 — The old tower",
  text: "Your enigma text here..."
}
```

The numbers correspond to:

1. Latitude degrees
2. Latitude minutes
3. Latitude seconds
4. Longitude degrees
5. Longitude minutes
6. Longitude seconds

## Test locally

Double-click `index.html`, or open the folder with VS Code and use the Live Server extension.

Use the floating **Setup** button to:

- choose a countdown date,
- preview the enigma page,
- return to the countdown.

## Publish for free

You can upload the four files to:

- GitHub Pages
- Netlify
- Cloudflare Pages
- Vercel

No server or database is required.


## Hide the Setup button for production

Open `script.js` and change:

```js
const SHOW_SETUP_BUTTON = true;
```

to:

```js
const SHOW_SETUP_BUTTON = false;
```

This hides both the floating Setup button and the settings panel.


## Choose N/S and E/W in Setup

Open the Setup panel and select:

- Latitude hemisphere: North (N) or South (S)
- Longitude hemisphere: East (E) or West (W)

The selected letters are saved in the browser and automatically used when opening Google Maps.


## Automatic Google Maps redirect

When the user enters the final correct coordinate value, the website automatically redirects to Google Maps in the same browser tab. Using the same tab is more reliable on mobile browsers than opening a popup or new tab.

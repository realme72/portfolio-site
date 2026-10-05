# Gaurav Bharti: portfolio

Personal portfolio site: an interactive 3D-style desk, a work globe with a grid fallback, and an about page.

Plain HTML/CSS/JS, no build step.

```sh
python3 -m http.server 5173   # then open http://localhost:5173
```

- `index.html`: home (desk, work, contact)
- `about.html`: about page (photo, intro, tabbed details)
- `desk.js`: draggable desk objects, drawers, the cat + BYTE speech bubble
- `globe.js`: work globe (d3 + topojson, map data in `assets/countries-110m.json`); the bento cards are the "grid" view
- `scene.js`: earlier room illustration with day/night toggle (not currently used)
- `script.js`: shared config (email, links, career start date), badges, emotes, tabs
- `style.css`: dark IDE theme

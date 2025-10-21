# YouTube Comments Sidebar Extension


https://github.com/user-attachments/assets/718280e1-f7fa-46f8-b150-38c9d831d364


A simple Chrome extension that moves YouTube comments to a sidebar above the recommended videos section. All comment features work - likes, replies, posting, everything!

## What it does

- Puts YouTube comments in a nice sidebar on the right
- Keep all the features - like, reply, post comments, load more, etc.
- Clean UI that matches YouTube's design
- Works with dark/light mode

## Installation

1. Download/clone this repo
2. Create an `images` folder and add your `icon.png` (or `icon.jpg`)
3. Add placeholder icons: `icon16.png`, `icon48.png`, `icon128.png` (or use any icons you want)
4. Open Chrome and go to `chrome://extensions/`
5. Turn on "Developer mode" (top right corner)
6. Click "Load unpacked"
7. Select the extension folder
8. Done! Visit any YouTube video

## Files

```
├── manifest.json      # Extension config
├── content.js         # Main logic
├── styles.css         # Styling
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── images/
│   └── icon.png       # Your custom icon
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
└── icon128.png        # Extension icon (128x128)
```

## Controls

- **↻** - Refresh comments
- **✕** - Hide/show sidebar

## Known Issues

- Sometimes when you switch videos, comments take a few seconds to load
- If comments don't show up, scroll down on the page or click the refresh button
- Works best on desktop (mobile YouTube is different)

## How it works

The extension finds YouTube's actual comments section and physically moves it into a custom sidebar. This way all the buttons and features work exactly like normal - I'm not copying anything, just relocating it!

## License

Do whatever you want with it ¯\\\_(ツ)\_/¯

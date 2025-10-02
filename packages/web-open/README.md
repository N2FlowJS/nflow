# Web Open Node

## Description
Opens a web page in a browser using Puppeteer. This node creates a browser session that can be used by subsequent web automation nodes (web-click, web-typing, etc.).

## Features
- Opens URLs in a headless or visible browser
- Configurable viewport size
- Custom user agent support
- Wait conditions for page load
- Reuses browser instance across multiple operations
- Stores page information in variables

## Form Fields

### URL
- **url** (required): The URL to open. Supports variable substitution with `{{variableName}}` syntax.

### Browser Settings
- **headless** (default: true): Run browser in headless mode (no visible window)
- **viewport.width** (default: 1920): Browser window width in pixels
- **viewport.height** (default: 1080): Browser window height in pixels
- **userAgent** (optional): Custom user agent string
- **timeout** (default: 30000): Maximum time to wait for page load in milliseconds
- **waitUntil** (default: "networkidle2"): When to consider navigation succeeded
  - `load`: Page load event fired
  - `domcontentloaded`: DOM content loaded
  - `networkidle0`: No network connections for at least 500ms
  - `networkidle2`: No more than 2 network connections for at least 500ms

## Output Variables
- `{nodeId}_url`: The final URL after navigation (handles redirects)
- `{nodeId}_title`: The page title
- `{nodeId}_browser`: Browser instance ID (always "global-browser")
- `{nodeId}_page`: Page instance ID (always "global-page")

## Example Usage

### Basic Usage
```json
{
  "url": "https://example.com",
  "headless": true,
  "waitUntil": "networkidle2"
}
```

### With Variable
```json
{
  "url": "{{searchUrl}}",
  "viewport": {
    "width": 1280,
    "height": 720
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

## Notes
- This node creates a global browser instance that is reused across multiple web operations
- Subsequent web-click and web-typing nodes will use the same browser session
- Use the `closeWebBrowser()` export function to close the browser when done
- The browser instance persists until explicitly closed or the process ends

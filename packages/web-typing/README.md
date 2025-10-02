# Web Typing Node

## Description
Types text into an input field or textarea on the current web page. This node requires an active browser session from a web-open node.

## Features
- Multiple selector types: CSS, XPath, or placeholder/aria-label text
- Clear existing text before typing
- Optional Enter key press after typing
- Simulated human typing with configurable delay
- Wait for element to appear
- Returns element information and typed text

## Form Fields

### Element Selector
- **selector** (required): Input element selector. Supports variable substitution with `{{variableName}}` syntax.
- **selectorType** (default: "css"): Type of selector
  - `css`: CSS selector (e.g., `input[name='search']`, `#emailInput`)
  - `xpath`: XPath expression (e.g., `//input[@type='text']`)
  - `text`: Find by placeholder or aria-label (e.g., `Search`, `Email address`)

### Text Content
- **text** (required): Text to type into the element. Supports variable substitution.

### Typing Settings
- **clearBefore** (default: true): Clear existing text before typing
- **pressEnter** (default: false): Press Enter key after typing (useful for search forms)
- **typingDelay** (default: 50): Delay between each keystroke in milliseconds (simulates human typing)
- **waitForSelector** (default: true): Wait for element to appear before typing
- **timeout** (default: 30000): Maximum time to wait for element in milliseconds

## Output Variables
- `{nodeId}_typed`: Boolean indicating successful typing
- `{nodeId}_text`: The text that was typed
- `{nodeId}_element`: Information about the input element
  - `tagName`: HTML tag name
  - `value`: Current value after typing
  - `id`: Element ID attribute
  - `className`: Element class names
  - `placeholder`: Placeholder text

## Example Usage

### Basic Search Input
```json
{
  "selector": "input[name='q']",
  "selectorType": "css",
  "text": "Puppeteer tutorial",
  "pressEnter": true
}
```

### Email Form with Variables
```json
{
  "selector": "#email",
  "selectorType": "css",
  "text": "{{userEmail}}",
  "clearBefore": true,
  "typingDelay": 100
}
```

### Find by Placeholder Text
```json
{
  "selector": "Search",
  "selectorType": "text",
  "text": "{{searchQuery}}",
  "pressEnter": true
}
```

### Slow Typing (Human-like)
```json
{
  "selector": "textarea#message",
  "selectorType": "css",
  "text": "Hello, this is a test message.",
  "typingDelay": 150,
  "clearBefore": false
}
```

## Notes
- Requires an active browser page from web-open node
- Will throw an error if no browser page is available
- Clicking the element before typing ensures it's focused
- The `typingDelay` parameter simulates human typing speed
- Use `pressEnter` for search forms or inputs that submit on Enter
- Supports both `input` and `textarea` elements
- Element must be visible and interactable

# Web Click Node

## Description
Clicks an element on the current web page. This node requires an active browser session from a web-open node.

## Features
- Multiple selector types: CSS, XPath, or text content
- Single, double, or right-click support
- Wait for element to appear
- Configurable timeout and delay
- Returns clicked element information

## Form Fields

### Element Selector
- **selector** (required): Element selector to click. Supports variable substitution with `{{variableName}}` syntax.
- **selectorType** (default: "css"): Type of selector
  - `css`: CSS selector (e.g., `button.submit`, `#loginBtn`)
  - `xpath`: XPath expression (e.g., `//button[@type='submit']`)
  - `text`: Find element by text content (e.g., `Login`, `Submit`)

### Click Settings
- **clickType** (default: "single"): Type of click to perform
  - `single`: Single click
  - `double`: Double click
  - `right`: Right click (context menu)
- **waitForSelector** (default: true): Wait for element to appear before clicking
- **timeout** (default: 30000): Maximum time to wait for element in milliseconds
- **delay** (default: 0): Wait time before clicking in milliseconds

## Output Variables
- `{nodeId}_clicked`: Boolean indicating successful click
- `{nodeId}_element`: Information about the clicked element
  - `tagName`: HTML tag name
  - `text`: Text content (truncated to 100 characters)
  - `id`: Element ID attribute
  - `className`: Element class names

## Example Usage

### CSS Selector
```json
{
  "selector": "button.submit-btn",
  "selectorType": "css",
  "clickType": "single"
}
```

### XPath Selector
```json
{
  "selector": "//button[contains(text(), 'Login')]",
  "selectorType": "xpath",
  "waitForSelector": true,
  "timeout": 10000
}
```

### Text Content
```json
{
  "selector": "Submit",
  "selectorType": "text",
  "delay": 500
}
```

### With Variable
```json
{
  "selector": "{{buttonSelector}}",
  "selectorType": "css",
  "clickType": "double"
}
```

## Notes
- Requires an active browser page from web-open node
- Will throw an error if no browser page is available
- Supports dynamic selectors using variable substitution
- Element information is captured and stored in variables for later use

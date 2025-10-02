# Web Automation Packages

These three packages provide web browser automation capabilities using Puppeteer in NFlow.

## Packages

### 1. web-open
Opens a web page in the browser and creates a working session.

### 2. web-click
Clicks on elements on the web page.

### 3. web-typing
Types text into input fields or textareas.

## General Workflow

### Step 1: Open web page with `web-open`
```
web-open node
├── URL: https://example.com
├── Headless: true
└── Wait Until: networkidle2
```

### Step 2: Interact with elements
After the web page is opened, you can use `web-click` and `web-typing` to interact:

```
web-open → web-typing → web-click → ...
```

## Example: Auto Login

### Flow:
1. **web-open**: Open login page
2. **web-typing**: Enter username into email field
3. **web-typing**: Enter password into password field
4. **web-click**: Click "Login" button

### Configuration Details:

#### Node 1: Open Login Page
```json
{
  "type": "web-open",
  "form": {
    "url": "https://example.com/login",
    "headless": true,
    "waitUntil": "networkidle2"
  }
}
```

#### Node 2: Enter Email
```json
{
  "type": "web-typing",
  "form": {
    "selector": "input[name='email']",
    "selectorType": "css",
    "text": "{{userEmail}}",
    "clearBefore": true
  }
}
```

#### Node 3: Enter Password
```json
{
  "type": "web-typing",
  "form": {
    "selector": "input[type='password']",
    "selectorType": "css",
    "text": "{{userPassword}}",
    "clearBefore": true
  }
}
```

#### Node 4: Click Login Button
```json
{
  "type": "web-click",
  "form": {
    "selector": "button[type='submit']",
    "selectorType": "css",
    "clickType": "single"
  }
}
```

## Example: Auto Google Search

### Flow:
1. **web-open**: Open Google
2. **web-typing**: Enter search keywords and press Enter
3. **web-click**: Click the first result

### Configuration Details:

#### Node 1: Open Google
```json
{
  "type": "web-open",
  "form": {
    "url": "https://www.google.com",
    "headless": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

#### Node 2: Type Search Query
```json
{
  "type": "web-typing",
  "form": {
    "selector": "input[name='q']",
    "selectorType": "css",
    "text": "{{searchQuery}}",
    "pressEnter": true,
    "typingDelay": 100
  }
}
```

#### Node 3: Click First Result
```json
{
  "type": "web-click",
  "form": {
    "selector": "h3",
    "selectorType": "css",
    "delay": 2000,
    "waitForSelector": true
  }
}
```

## Selector Types

### 1. CSS Selector (Recommended)
```json
{
  "selector": "button.submit-btn",
  "selectorType": "css"
}
```

**Examples:**
- `input[name='email']` - Input with name="email"
- `#loginBtn` - Element with id="loginBtn"
- `.btn-primary` - Element with class="btn-primary"
- `div > button` - Button direct child of div

### 2. XPath
```json
{
  "selector": "//button[contains(text(), 'Login')]",
  "selectorType": "xpath"
}
```

**Examples:**
- `//input[@type='text']` - Input with type="text"
- `//button[text()='Submit']` - Button with exact text "Submit"
- `//div[@class='container']//a` - Link inside div with class="container"

### 3. Text Content
```json
{
  "selector": "Login",
  "selectorType": "text"
}
```

**When to use:**
- Find element by text content
- Find input by placeholder
- Find element by aria-label

## Variables

Web nodes store information in variables for use in subsequent nodes:

### web-open output:
- `{nodeId}_url`: URL cuối cùng (sau khi redirect)
- `{nodeId}_title`: Tiêu đề trang
- `{nodeId}_browser`: ID của browser instance
- `{nodeId}_page`: ID của page instance

### web-click output:
- `{nodeId}_clicked`: true nếu click thành công
- `{nodeId}_element`: Thông tin element đã click

### web-typing output:
- `{nodeId}_typed`: true if typing succeeded
- `{nodeId}_text`: Text that was entered
- `{nodeId}_element`: Input element information

## Best Practices

### 1. Use waitForSelector
Always enable `waitForSelector: true` to ensure the element is loaded before interaction.

### 2. Set appropriate timeouts
- Fast loading pages: 10000ms (10s)
- Slow loading pages: 30000ms (30s)
- Very slow pages: 60000ms (60s)

### 3. Use CSS Selectors when possible
CSS selectors are faster and easier to maintain than XPath.

### 4. Delay for realistic user behavior
Use `typingDelay` (50-150ms) to simulate real user typing.

### 5. Headless vs Visible
- Development/Debug: `headless: false` to see the browser
- Production: `headless: true` to save resources

### 6. Error handling
Always set up error handling nodes after web nodes to catch timeouts or element not found errors.

## Important Notes

1. **Browser Instance**: There is only one global browser instance, reused between nodes
2. **Page Instance**: Each `web-open` closes the old page and creates a new one
3. **Close Browser**: Browser automatically closes when the process ends
4. **Dependencies**: Need to install `puppeteer` package: `npm install puppeteer`

## Troubleshooting

### Element not found
- Check if selector is correct
- Increase timeout
- Enable `waitForSelector`
- Try with different `selectorType`

### Timeout
- Increase timeout value
- Check network connection
- Try `waitUntil: 'domcontentloaded'` instead of `networkidle2`

### Click not working
- Ensure element is visible
- Try adding delay before click
- Check if element is covered by overlay

### Typing not working
- Ensure element is input or textarea
- Element must be visible and interactable
- Try clicking on element before typing

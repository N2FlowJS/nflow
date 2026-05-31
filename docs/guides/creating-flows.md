# Creating Your First Flow

Follow this step-by-step guide to build a functional AI assistant from scratch.

## 1. Initialize a New Flow
1. Open the N2FLOW dashboard.
2. Click **New Flow** in the top right.
3. You'll see an empty canvas. Give your flow a name in the top bar (e.g., "My AI Helper").

## 2. Add the Core Nodes
Use the sidebar or right-click to add the following nodes:
- **Chat Input**: To receive your messages.
- **Prompt Template**: To define the agent's behavior.
- **vLLM Chat**: To configure the AI model.
- **Agent**: To process the logic.
- **Chat Output**: To show the result.

## 3. Connect the Logic
Drag edges between handles to define the data flow:
1. Connect **vLLM Chat** → **Agent** (`agent_llm` handle).
2. Connect **Prompt Template** → **Agent** (`system_prompt` handle).
3. Connect **Chat Input** → **Agent** (`input_value` handle).
4. Connect **Agent** → **Chat Output** (`response` handle).

## 4. Configure the Nodes
Click each node to open its config panel:
- **Prompt Template**: Enter a system instruction like: "You are a friendly assistant. Help the user with their questions."
- **vLLM Chat**: Select a **Provider ID** (if you have one configured) or enter a Base URL and API Key manually. Choose a model (e.g., `gpt-4o`).

## 5. Test Your Flow
1. Click the **Zap (Run)** icon in the header. This will open the **Playground**.
2. Type a message like "Hello!" in the input box.
3. Watch the nodes light up as they execute!
4. See the AI's response stream back in the Playground.

## 6. Add a Tool (Optional)
Let's make our assistant more powerful by giving it web search capabilities:
1. Add a **Serper Search** node to the canvas.
2. Connect **Serper Search** → **Agent** (`tools` handle).
3. Configure your Serper API Key in the Serper Search node.
4. Now, try asking the Playground: "What's the weather in Hanoi right now?"
5. The Agent will automatically detect it needs the search tool, fetch the data, and summarize it for you.

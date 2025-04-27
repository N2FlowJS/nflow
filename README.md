# NFlow Architecture and Document Processing Flow

```bash
╔═══════════════════════════════════════════╗                                      
║    _   _       _____ _                    ║
║   | \ | |     |  ___| | _____      __     ║
║   |  \| |_____| |_  | |/ _ \ \ /\ / /     ║
║   | |\  |_____|  _| | | (_) \ V  V /      ║
║   |_| \_|     |_|   |_|\___/ \_/\_/       ║ 
║                                           ║
╚═══════════════════════════════════════════╝
```

> **The Next-Generation Native Flow for Document Processing and RAG in Node.js**

[![GitHub stars](https://img.shields.io/github/stars/N2FlowJS/nflow)](https://github.com/N2FlowJS/nflow/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/N2FlowJS/nflow)](https://github.com/N2FlowJS/nflow/network/members)
[![GitHub issues](https://img.shields.io/github/issues/N2FlowJS/nflow)](https://github.com/N2FlowJS/nflow/issues)
[![GitHub license](https://img.shields.io/github/license/N2FlowJS/nflow)](https://github.com/N2FlowJS/nflow/blob/main/LICENSE)

📚 [Documentation](https://n2flowjs.github.io/nflow)  
💻 [GitHub Repository](https://github.com/N2FlowJS/nflow)

---

## ✨ Features

- ⚡ **Ultra Fast:** 100% native JavaScript/TypeScript, zero dependencies.
- 🧠 **Intelligent Pipelines:** Ingest, process, embed, store, and query seamlessly.
- 🗂️ **Fully Modular:** Swap in your own loaders, splitters, embedders, and stores.
- 🔍 **Optimized Search:** High-performance vector similarity search.
- 🔄 **Scalable:** From prototypes to enterprise-grade deployments.
- 🔥 **Designed for RAG:** Perfect foundation for Retrieval-Augmented Generation.

---

## 🔥 Why N-Flow?
- 🏎 Zero Overhead: Native Node.js, no unnecessary bloat.
- 🛡 Reliable: Structured error handling for stability.
- 🔧 Extensible: Customize each pipeline step easily.
- 🧠 AI-Ready: Designed for semantic search and LLM-based systems.
---

## 🧩 Core Concepts

| Concept           | Description |
|-------------------|-------------|
| **Loader**         | Import documents from file systems, URLs, APIs, etc. |
| **Splitter**       | Divide documents into smaller semantic chunks. |
| **Embedder**       | Transform text into vector embeddings. |
| **Vector Store**   | Store embeddings and enable fast retrieval. |
| **Flow**           | Orchestrate full ingestion and retrieval processes. |

---

## 📚 Architecture Overview

![N-Flow Architecture Diagram](./docs/assets/nflow-architecture.png?t=20231001)

> **Flow of Documents:** Load → Preprocess → Embed → Store  
> **Flow of Queries:** Embed Query → Retrieve → Respond

---

## 🚀 Why Choose N-Flow?

- 🏎️ **Blazing Fast:** Built for speed, not bloat.
- 🧩 **Composable:** Easily integrate your preferred libraries and models.
- 📚 **AI-First:** Specifically optimized for LLMs and semantic applications.
- 🛡️ **Production-Ready:** Robust error handling, test coverage, and extensibility.

---

## 📈 Roadmap

- [x] Built-in loaders for PDF, Word, Text files.
- [ ] Real-time ingestion with WebSocket support.
- [ ] Sharded vector storage for horizontal scaling.
- [ ] Summarization modules for large docs.
- [ ] Integration with LangChain, LlamaIndex, etc.

---

## 🤝 Contributing

We ❤️ contributions!

```bash
git clone https://github.com/N2FlowJS/nflow.git
cd nflow
npm install
npm run dev
```

Please check out [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📜 License

This project is licensed under the **MIT License**.

---

> Powered by passion, built for scale — N-Flow is the heartbeat of document-driven AI applications.

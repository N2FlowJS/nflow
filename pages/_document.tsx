import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

async function loadPluginConfig() {
	try {
		const mod: any = await import('../packages/@node-plugin');
		if (mod?.getNodePluginConfig) return mod.getNodePluginConfig();
	} catch {
		// ignore load failures in _document
	}
	return {};
}

class NflowDocument extends Document<{ pluginConfigJSON?: string }> {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		const cfg = await loadPluginConfig();
		let pluginConfigJSON = '';
		try {
			pluginConfigJSON = JSON.stringify(cfg);
		} catch {
			pluginConfigJSON = '{}';
		}
		return { ...initialProps, pluginConfigJSON } as any;
	}

	render() {
		const injected = (this.props as any).pluginConfigJSON || '{}';
		return (
			<Html>
				<Head />
				<body>
					{/* Inject plugin config early so client registries can consume it */}
					<script
						dangerouslySetInnerHTML={{
							__html: `window.__NFLOW_NODE_PLUGIN_CONFIG__ = ${injected};`,
						}}
					/>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default NflowDocument;
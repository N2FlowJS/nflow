import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

type NodePluginModule = { getNodePluginConfig?: () => unknown };

async function loadPluginConfig(): Promise<unknown> {
	try {
		const mod: NodePluginModule = await import('../packages/@node-plugin');
		if (mod?.getNodePluginConfig) return mod.getNodePluginConfig();
	} catch {
		// ignore load failures in _document
	}
	return {};
}

class NflowDocument extends Document<{ pluginConfigJSON?: string }> {
	static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { pluginConfigJSON?: string }> {
		const initialProps = await Document.getInitialProps(ctx);
		const cfg = await loadPluginConfig();
		let pluginConfigJSON = '';
		try {
			pluginConfigJSON = JSON.stringify(cfg);
		} catch {
			pluginConfigJSON = '{}';
		}
		return { ...initialProps, pluginConfigJSON };
	}

	render() {
		const injected = this.props.pluginConfigJSON || '{}';
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
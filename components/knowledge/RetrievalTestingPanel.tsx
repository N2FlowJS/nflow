import React, { useState } from 'react';
import {
    Card, Typography, Input, Button, Slider, InputNumber,
    Space, Divider, List, Tag, Empty, Spin, Collapse, Alert
} from 'antd';
import { SearchOutlined, ExperimentOutlined } from '@ant-design/icons';
import {  testKnowledgeRetrieval } from '../../services/knowledgeService';
import { SearchSimilarResult } from '@lib/services/vectorSearchService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface RetrievalTestingPanelProps {
    knowledgeId: string;
}


const RetrievalTestingPanel: React.FC<RetrievalTestingPanelProps> = ({ knowledgeId }) => {
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(5);
    const [threshold, setThreshold] = useState(0.7);
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{
        timestamp: number;
        results: SearchSimilarResult[];
        error?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRunTest = async () => {
        if (!query.trim()) {
            setError('Please enter a query to test');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result = await testKnowledgeRetrieval(knowledgeId, {
                query: query.trim(),
                limit,
                threshold
            });

            setTestResult(result);
        } catch (err) {
            console.error('Error running retrieval test:', err);
            setError('Failed to run retrieval test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSimilarityBadge = (similarity: number) => {
        let color = 'red';
        if (similarity >= 0.9) color = 'green';
        else if (similarity >= 0.8) color = 'lime';
        else if (similarity >= 0.7) color = 'blue';
        else if (similarity >= 0.5) color = 'orange';

        return (
            <Tag color={color}>
                {(similarity * 100).toFixed(1)}% match
            </Tag>
        );
    };

    return (
        <Card
            title={
                <Space>
                    <ExperimentOutlined />
                    <span>Retrieval Testing</span>
                </Space>
            }
            className="retrieval-testing-panel"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {error && (
                    <Alert type="error" message={error} closable onClose={() => setError(null)} />
                )}

                <div>
                    <Text strong>Test Query</Text>
                    <TextArea
                        placeholder="Enter your test query here..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={3}
                        style={{ marginTop: 8 }}
                    />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <Text strong>Results Limit</Text>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                            <Slider
                                min={1}
                                max={20}
                                value={limit}
                                onChange={setLimit}
                                style={{ flex: 1, marginRight: 16 }}
                            />
                            <InputNumber
                                min={1}
                                max={20}
                                value={limit}
                                onChange={(value) => setLimit(value || 5)}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <Text strong>Similarity Threshold</Text>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                            <Slider
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={threshold}
                                onChange={setThreshold}
                                style={{ flex: 1, marginRight: 16 }}
                            />
                            <InputNumber
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={threshold}
                                onChange={(value) => setThreshold(value || 0.7)}
                                formatter={value => `${(Number(value) * 100).toFixed(0)}%`}
                                parser={value => Number(value?.replace('%', '')) / 100}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleRunTest}
                    loading={loading}
                    block
                >
                    Run Test
                </Button>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin tip="Running retrieval test..." />
                    </div>
                )}

                {testResult && !loading && (
                    <>
                        <Divider>Test Results</Divider>
                        <div className="test-results">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text type="secondary">Time:</Text> {new Date(testResult.timestamp).toLocaleString()}
                                </div>

                                <Alert
                                    message={`Found ${testResult.results.length} results for your query`}
                                    type={testResult.results.length > 0 ? "success" : "info"}
                                    showIcon
                                />

                                {testResult.results.length === 0 ? (
                                    <Empty description="No results found. Try adjusting your query or lowering the similarity threshold." />
                                ) : (
                                    <List
                                        itemLayout="vertical"
                                        dataSource={testResult.results}
                                        renderItem={(item, index) => (
                                            <List.Item
                                                extra={renderSimilarityBadge(item.similarity)}
                                            >
                                                <List.Item.Meta
                                                    title={<Text strong>{index + 1}. From: {item.fileName}</Text>}
                                                />
                                                <div className="result-content" style={{
                                                    padding: '12px',
                                                    background: '#f9f9f9',
                                                    borderRadius: '4px',
                                                    marginTop: '8px'
                                                }}>
                                                    <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}>
                                                        {item.content}
                                                    </Paragraph>
                                                </div>

                                                {item.metadata && Object.keys(item.metadata).length > 0 && (
                                                    <Collapse ghost style={{ marginTop: '8px' }}>
                                                        <Panel header="Metadata" key="1">
                                                            <pre style={{ fontSize: '12px' }}>
                                                                {JSON.stringify(item.metadata, null, 2)}
                                                            </pre>
                                                        </Panel>
                                                    </Collapse>
                                                )}
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </Space>
                        </div>
                    </>
                )}
            </Space>
        </Card>
    );
};

export default RetrievalTestingPanel;

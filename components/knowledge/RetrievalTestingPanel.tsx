import React, { useState } from 'react';
import {
    Card, Typography, Input, Button, Slider, InputNumber,
    Space, Divider, List, Tag, Empty, Spin, Collapse, Alert, Grid
} from 'antd';
import { SearchOutlined, ExperimentOutlined } from '@ant-design/icons';
import { testKnowledgeRetrieval } from '../../services/knowledgeService';
import { SearchSimilarResult } from '@lib/services/vectorSearchService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

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
    const screens = useBreakpoint();

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

    // Calculate responsive sizes
    const isMobile = !screens.sm;
    const sliderWidth = isMobile ? '100%' : 'flex: 1; margin-right: 16px';
    
    return (
        <Card
            title={
                <Space>
                    <ExperimentOutlined />
                    <span>Retrieval Testing</span>
                </Space>
            }
            className="retrieval-testing-panel"
            bodyStyle={{ padding: isMobile ? '12px' : '24px' }}
            size={isMobile ? 'small' : 'default'}
        >
            <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
                {error && (
                    <Alert type="error" message={error} closable onClose={() => setError(null)} />
                )}

                <div>
                    <Text strong>Test Query</Text>
                    <TextArea
                        placeholder="Enter your test query here..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={isMobile ? 2 : 3}
                        style={{ marginTop: 8 }}
                    />
                </div>

                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '20px' 
                }}>
                    <div style={{ 
                        flex: 1, 
                        minWidth: isMobile ? '100%' : '200px'
                    }}>
                        <Text strong>Results Limit</Text>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginTop: 8,
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '8px' : '0'
                        }}>
                            <Slider
                                min={1}
                                max={20}
                                value={limit}
                                onChange={setLimit}
                                style={{ width: '100%' }}
                            />
                            <InputNumber
                                min={1}
                                max={20}
                                value={limit}
                                onChange={(value) => setLimit(value || 5)}
                                style={{ width: isMobile ? '100%' : 'auto' }}
                            />
                        </div>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        minWidth: isMobile ? '100%' : '200px'
                    }}>
                        <Text strong>Similarity Threshold</Text>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginTop: 8,
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '8px' : '0'
                        }}>
                            <Slider
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={threshold}
                                onChange={setThreshold}
                                style={{ width: '100%' }}
                            />
                            <InputNumber
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={threshold}
                                onChange={(value) => setThreshold(value || 0.7)}
                                formatter={value => `${(Number(value) * 100).toFixed(0)}%`}
                                parser={value => Number(value?.replace('%', '')) / 100}
                                style={{ width: isMobile ? '100%' : 'auto' }}
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
                    size={isMobile ? 'middle' : 'large'}
                >
                    Run Test
                </Button>

                {loading && (
                    <div style={{ textAlign: 'center', padding: isMobile ? '12px 0' : '20px 0' }}>
                        <Spin tip="Running retrieval test..." />
                    </div>
                )}

                {testResult && !loading && (
                    <>
                        <Divider orientation={isMobile ? "left" : "center"} style={{ margin: isMobile ? '12px 0' : '24px 0' }}>
                            Test Results
                        </Divider>
                        <div className="test-results">
                            <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
                                <div>
                                    <Text type="secondary">Time:</Text> {new Date(testResult.timestamp).toLocaleString()}
                                </div>

                                <Alert
                                    message={`Found ${testResult.results.length} results for your query`}
                                    type={testResult.results.length > 0 ? "success" : "info"}
                                    showIcon
                                />

                                {testResult.results.length === 0 ? (
                                    <Empty 
                                        description="No results found. Try adjusting your query or lowering the similarity threshold."
                                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    />
                                ) : (
                                    <List
                                        itemLayout="vertical"
                                        dataSource={testResult.results}
                                        renderItem={(item, index) => (
                                            <List.Item
                                                style={{ padding: isMobile ? '8px 0' : '12px 0' }}
                                                extra={isMobile ? null : renderSimilarityBadge(item.similarity)}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <div style={{ 
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            flexWrap: 'wrap',
                                                            gap: '8px'
                                                        }}>
                                                            <Text strong>{index + 1}. From: {item.fileName}</Text>
                                                            {isMobile && renderSimilarityBadge(item.similarity)}
                                                        </div>
                                                    }
                                                />
                                                <div className="result-content" style={{
                                                    padding: isMobile ? '8px' : '12px',
                                                    background: '#f9f9f9',
                                                    borderRadius: '4px',
                                                    marginTop: '8px',
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    overflowWrap: 'break-word',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    <Paragraph 
                                                        ellipsis={{ 
                                                            rows: isMobile ? 3 : 4, 
                                                            expandable: true, 
                                                            symbol: 'more' 
                                                        }}
                                                    >
                                                        {item.content}
                                                    </Paragraph>
                                                </div>

                                                {item.metadata && Object.keys(item.metadata).length > 0 && (
                                                    <Collapse ghost style={{ marginTop: '8px' }}>
                                                        <Panel header="Metadata" key="1">
                                                            <div style={{ 
                                                                maxWidth: '100%', 
                                                                overflowX: 'auto' 
                                                            }}>
                                                                <pre style={{ 
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {JSON.stringify(item.metadata, null, 2)}
                                                                </pre>
                                                            </div>
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

import { ExperimentOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Empty,
  Grid,
  Input,
  InputNumber,
  Progress,
  Row,
  Slider,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { SearchSimilarResult } from '../../lib/services/vectorSearchService';
import { useLocale } from '../../locale'; // Add this import
import { testKnowledgeRetrieval } from '../../services/knowledgeService';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

interface RetrievalTestingPanelProps {
  knowledgeId: string;
}

const RetrievalTestingPanel: React.FC<RetrievalTestingPanelProps> = ({ knowledgeId }) => {
  const { t } = useLocale(); // Get the t function
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
  const [queryProgress, setQueryProgress] = useState(0);
  const screens = useBreakpoint();

  const handleRunTest = async () => {
    if (!query.trim()) {
      setError(t('knowledgeDetail.testing.queryError'));
      return;
    }

    setError(null);
    setLoading(true);
    setQueryProgress(0);

    // Simulate progress for better user experience
    const progressInterval = setInterval(() => {
      setQueryProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 300);

    try {
      const result = await testKnowledgeRetrieval(knowledgeId, {
        query: query.trim(),
        limit,
        threshold,
      });

      setQueryProgress(100);
      setTestResult(result);
    } catch (err) {
      console.error('Error running retrieval test:', err);
      setError(t('knowledgeDetail.testing.runFailedError'));
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setQueryProgress(0);
      }, 500); // Give users time to see 100% completion
    }
  };

  const renderSimilarityBadge = (similarity: number) => {
    let color = 'red';
    let description = t('knowledgeDetail.testing.similarityLow');

    if (similarity >= 0.9) {
      color = 'green';
      description = t('knowledgeDetail.testing.similarityVeryHigh');
    } else if (similarity >= 0.8) {
      color = 'lime';
      description = t('knowledgeDetail.testing.similarityHigh');
    } else if (similarity >= 0.7) {
      color = 'blue';
      description = t('knowledgeDetail.testing.similarityMedium');
    } else if (similarity >= 0.5) {
      color = 'orange';
      description = t('knowledgeDetail.testing.similarityModerate');
    }

    return (
      <Tooltip title={description}>
        <Tag color={color} style={{ cursor: 'help' }}>
          {(similarity * 100).toFixed(1)}% {!isMobile && description}
        </Tag>
      </Tooltip>
    );
  };

  // Calculate responsive sizes
  const isMobile = !screens.sm;

  return (
    <Card
      title={
        <Space>
          <ExperimentOutlined />
          <span>{t('knowledgeDetail.testing.title')}</span>
        </Space>
      }
      className="dashboard-card retrieval-testing-panel"
      size={isMobile ? 'small' : 'default'}>
      <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
        {error && <Alert type="error" message={error} closable onClose={() => setError(null)} />}

        {/* Query Input and Controls */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Text strong>{t('knowledgeDetail.testing.testQueryLabel')}</Text>
            <TextArea
              placeholder={t('knowledgeDetail.testing.testQueryPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={isMobile ? 2 : 3}
              style={{ marginTop: 8 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Text strong>{t('knowledgeDetail.testing.resultsLimitLabel')}</Text>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 8,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '0',
              }}>
              <Slider min={1} max={20} value={limit} onChange={setLimit} style={{ width: '100%' }} />
              <InputNumber
                min={1}
                max={20}
                value={limit}
                onChange={(value) => setLimit(value || 5)}
                style={{ width: isMobile ? '100%' : 'auto' }}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>{t('knowledgeDetail.testing.similarityThresholdLabel')}</Text>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 8,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '0',
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
                formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
                parser={(value) => Number(value?.replace('%', '')) / 100}
                style={{ width: isMobile ? '100%' : 'auto' }}
              />
            </div>
          </Col>
          <Col xs={24}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleRunTest}
              loading={loading}
              block
              size={isMobile ? 'middle' : 'large'}>
              {t('knowledgeDetail.testing.runTestButton')}
            </Button>
          </Col>
        </Row>

        {loading && (
          <div style={{ textAlign: 'center', padding: isMobile ? '12px 0' : '20px 0' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Spin />
              <Typography.Text type="secondary">{t('knowledgeDetail.testing.runningTestTip')}</Typography.Text>
              <Progress percent={Math.round(queryProgress)} status="active" />
            </Space>
          </div>
        )}

        {/* Test Results */}
        {testResult && !loading && (
          <>
            <Divider orientation={isMobile ? 'left' : 'center'} style={{ margin: isMobile ? '12px 0' : '24px 0' }}>
              {t('knowledgeDetail.testing.resultsTitle')}
            </Divider>
            <div className="test-results">
              <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
                <div>
                  <Text type="secondary">{t('knowledgeDetail.testing.timeLabel')}</Text>{' '}
                  {new Date(testResult.timestamp).toLocaleString()}
                </div>

                <Alert
                  message={t('knowledgeDetail.testing.resultsFoundMessage', { count: testResult.results.length })}
                  type={testResult.results.length > 0 ? 'success' : 'info'}
                  showIcon
                />

                {/* Result Cards instead of List */}
                {testResult.results.length === 0 ? (
                  <Empty
                    description={t('knowledgeDetail.testing.noResultsFound')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Row gutter={[16, 16]}>
                    {testResult.results.map((item, index) => (
                      <Col key={index} xs={24} md={12} lg={8}>
                        <Card
                          size="small"
                          title={
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                              }}>
                              <Text strong>
                                {t('knowledgeDetail.testing.resultItemTitle', { index: index + 1, fileName: '' })}
                              </Text>
                              {renderSimilarityBadge(item.similarity)}
                            </div>
                          }
                          style={{ height: '100%' }}>
                          <div>
                            <Text strong style={{ fontSize: '13px' }}>
                              {item.fileName}
                            </Text>
                          </div>
                          <div
                            className="result-content"
                            style={{
                              padding: isMobile ? '8px' : '12px',
                              borderRadius: '4px',
                              marginTop: '8px',
                              fontSize: isMobile ? '13px' : '14px',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word',
                            }}>
                            <Paragraph
                              ellipsis={{
                                rows: isMobile ? 3 : 4,
                                expandable: true,
                                symbol: t('knowledgeDetail.testing.expandLabel'),
                              }}>
                              {item.content}
                            </Paragraph>
                          </div>

                          {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <Collapse
                              ghost
                              style={{ marginTop: '8px' }}
                              items={[
                                {
                                  key: '1',
                                  label: t('knowledgeDetail.testing.metadataHeader'),
                                  children: (
                                    <div
                                      style={{
                                        maxWidth: '100%',
                                        overflowX: 'auto',
                                      }}>
                                      <pre
                                        style={{
                                          fontSize: isMobile ? '11px' : '12px',
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word',
                                        }}>
                                        {JSON.stringify(item.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  ),
                                },
                              ]}
                            />
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
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

import { CopyOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Empty, List, Skeleton, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { getFileChunks } from '../../services/fileService';

const { Paragraph } = Typography;

interface FileChunk {
  id: string;
  content: string;
  chunkIndex: number;
  fileId: string;
  metadata: any;
  partitionId: string;
}

interface FileChunksProps {
  fileId: string;
}

export default function FileChunks({ fileId }: FileChunksProps) {
  const [chunks, setChunks] = useState<FileChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);

  useEffect(() => {
    if (fileId) {
      loadFileChunks(fileId);
    }
  }, [fileId]);

  const loadFileChunks = async (fileId: string) => {
    setChunksLoading(true);
    try {
      const data = await getFileChunks(fileId);
      const sortedChunks = [...data].sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));
      setChunks(sortedChunks);
    } catch (error: unknown) {
      console.error('Error loading file chunks:', error);
      message.error('Failed to load file chunks');
    } finally {
      setChunksLoading(false);
    }
  };

  const handleCopyChunk = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => message.success('Chunk content copied'))
      .catch((err) => {
        console.error('Failed to copy chunk content: ', err);
        message.error('Failed to copy');
      });
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      {chunksLoading ? (
        <div style={{ padding: '20px 0' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
          <Divider style={{ margin: '16px 0' }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : chunks.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={chunks}
          renderItem={(chunk, index) => (
            <List.Item
              style={{
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '8px',
              }}>
              <div
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Chunk {chunk.chunkIndex ?? index + 1}
                </Typography.Title>
                <Tooltip title="Copy content">
                  <Button
                    type="primary"
                    ghost
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyChunk(chunk.content)}
                    size="small">
                    Copy
                  </Button>
                </Tooltip>
              </div>

              <div style={{ marginBottom: '8px', padding: '4px 8px', borderRadius: '4px' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  Vector ID:{' '}
                </Typography.Text>
                <Typography.Text copyable={{ text: chunk.id }} style={{ fontSize: '12px' }}>
                  {chunk.id}
                </Typography.Text>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}>
                <Paragraph
                  ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '13px',
                    margin: 0,
                  }}>
                  {chunk.content}
                </Paragraph>
              </div>

              {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
                <Card>
                  <Typography.Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    Metadata:
                  </Typography.Text>
                  <pre
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      overflow: 'auto',
                      maxHeight: '100px',
                      margin: 0,
                    }}>
                    {JSON.stringify(chunk.metadata, null, 2)}
                  </pre>
                </Card>
              )}
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={
            <span>
              No chunks found for this file.
              <br />
              It might still be processing or wasn&apos;t chunked.
            </span>
          }
        />
      )}
    </div>
  );
}

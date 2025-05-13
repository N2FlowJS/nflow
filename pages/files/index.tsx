import React, { useEffect, useState } from 'react';
import {
  Space, Typography, Button, Input,
  Popconfirm, message, Tooltip, Tag, Card, List, Select, Empty
} from 'antd';
import {
  FileOutlined, DeleteOutlined,
  DownloadOutlined, SearchOutlined,
  EyeOutlined, FileExcelOutlined,
  FileImageOutlined, FilePdfOutlined,
  FileTextOutlined, FileUnknownOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchAllFiles, deleteFile, getFileDownloadUrl } from '../../services/fileService';
import Link from 'next/link';
import { getTypeFile } from '../../utils/client/formatters';

const { Title } = Typography;
const { Option } = Select;

interface File {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
  knowledgeId: string;
  knowledge?: {
    id: string;
    name: string;
  };
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllFiles();
      setFiles(data);
    } catch (error: unknown) {
      console.error('Error loading files:', error);
      message.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (file: File) => {
    try {
      const success = await deleteFile(file.knowledgeId, file.id);
      if (success) {
        message.success('File deleted successfully');
        loadFiles();
      } else {
        message.error('Failed to delete file');
      }
    } catch (error: unknown) {
      console.error('Delete error:', error);
      message.error('An error occurred while deleting the file');
    }
  };

  const handleDownload = (file: File) => {
    window.open(getFileDownloadUrl(file.knowledgeId, file.id), '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <FileImageOutlined style={{ fontSize: '24px' }} />;
    if (mimetype.includes('pdf')) return <FilePdfOutlined style={{ fontSize: '24px' }} />;
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return <FileExcelOutlined style={{ fontSize: '24px' }} />;
    if (mimetype.includes('text') || mimetype.includes('document')) return <FileTextOutlined style={{ fontSize: '24px' }} />;
    return <FileUnknownOutlined style={{ fontSize: '24px' }} />;
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchText.toLowerCase()) ||
    file.mimetype.toLowerCase().includes(searchText.toLowerCase()) ||
    (file.knowledge?.name?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortField === 'size') {
      return sortOrder === 'ascend' ? a.size - b.size : b.size - a.size;
    } else if (sortField === 'createdAt') {
      return sortOrder === 'ascend' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortField === 'name') {
      return sortOrder === 'ascend'
        ? a.originalName.localeCompare(b.originalName)
        : b.originalName.localeCompare(a.originalName);
    }
    return 0;
  });

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortField(field);
    setSortOrder(order as 'ascend' | 'descend');
  };

  return (
    <MainLayout title="File Management">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Title level={2}>
              <FileOutlined /> File Management
            </Title>
            <Space>
              <Select
                defaultValue="createdAt-descend"
                style={{ width: 180 }}
                onChange={handleSortChange}
                placeholder="Sort by"
                prefix={<SortAscendingOutlined />}
              >
                <Option value="createdAt-descend">Newest first</Option>
                <Option value="createdAt-ascend">Oldest first</Option>
                <Option value="size-descend">Largest first</Option>
                <Option value="size-ascend">Smallest first</Option>
                <Option value="name-ascend">Name (A-Z)</Option>
                <Option value="name-descend">Name (Z-A)</Option>
              </Select>
              <Input
                placeholder="Search files..."
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Space>
          </div>

          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            dataSource={sortedFiles}
            loading={loading}
            pagination={{
              pageSize: 12,
              showSizeChanger: false,
            }}
            renderItem={(file) => (
              <List.Item>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Tooltip title="View File" key="view">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => router.push(`/files/${file.id}`)}
                      />
                    </Tooltip>,
                    <Tooltip title="Download" key="download">
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(file)}
                      />
                    </Tooltip>,
                    isAuthenticated && (
                      <Popconfirm
                        key="delete"
                        title="Are you sure you want to delete this file?"
                        onConfirm={() => handleDeleteFile(file)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      {getFileIcon(file.mimetype)}
                      <div style={{ marginLeft: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography.Text strong ellipsis style={{ maxWidth: '100%', display: 'block' }}>
                          <Link href={`/files/${file.id}`}>{file.originalName}</Link>
                        </Typography.Text>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <Tag>{getTypeFile(file.mimetype)}</Tag>
                      <Typography.Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                        {formatFileSize(file.size)}
                      </Typography.Text>
                    </div>
                    
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        Uploaded: {new Date(file.createdAt).toLocaleString()}
                      </Typography.Text>
                    </div>
                    
                    {file.knowledge && (
                      <div style={{ marginTop: '8px' }}>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          Knowledge: <Link href={`/knowledge/${file.knowledgeId}`}>{file.knowledge.name}</Link>
                        </Typography.Text>
                      </div>
                    )}
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{
              emptyText: <Empty description="No files found" />
            }}
          />
        </Space>
      </div>
    </MainLayout>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Table, Space, Typography, Button, Input,
  Popconfirm, message, Tooltip, Tag
} from 'antd';
import {
  FileOutlined, DeleteOutlined,
  DownloadOutlined, SearchOutlined,
  EyeOutlined, FileExcelOutlined,
  FileImageOutlined, FilePdfOutlined,
  FileTextOutlined, FileUnknownOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchAllFiles, deleteFile, getFileDownloadUrl } from '../../services/fileService';
import Link from 'next/link';
import { getTypeFile } from '../../utils/formatters';

const { Title, Text } = Typography;

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
    } catch (error) {
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
    } catch (error) {
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
    if (mimetype.startsWith('image/')) return <FileImageOutlined />;
    if (mimetype.includes('pdf')) return <FilePdfOutlined />;
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return <FileExcelOutlined />;
    if (mimetype.includes('text') || mimetype.includes('document')) return <FileTextOutlined />;
    return <FileUnknownOutlined />;
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchText.toLowerCase()) ||
    file.mimetype.toLowerCase().includes(searchText.toLowerCase()) ||
    file.knowledge?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'File',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (text: string, record: File) => (
        <Space>
          {getFileIcon(record.mimetype)}
          <Link href={`/files/${record.id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'mimetype',
      key: 'mimetype',
      render: (type: string) => <Tag>{getTypeFile(type)}</Tag>,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
      sorter: (a: File, b: File) => a.size - b.size,
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: File, b: File) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Knowledge',
      dataIndex: ['knowledge', 'name'],
      key: 'knowledge',
      render: (text: string, record: File) => (
        <Link href={`/knowledge/${record.knowledgeId}`}>{text || 'Unknown Knowledge'}</Link>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: File) => (
        <Space>
          <Tooltip title="View File">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/files/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          {isAuthenticated && (
            <Popconfirm
              title="Are you sure you want to delete this file?"
              onConfirm={() => handleDeleteFile(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="File Management">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>
              <FileOutlined /> File Management
            </Title>
            <Input
              placeholder="Search files..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredFiles}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </div>
    </MainLayout>
  );
}

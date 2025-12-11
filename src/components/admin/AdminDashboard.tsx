'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, LogOut, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileInfo {
  name: string;
  size: number;
  modified: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadFiles(), loadConfig()]);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to load files', error);
      showMessage('error', 'Failed to load files');
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (data.activeFile) {
        setActiveFile(data.activeFile);
      }
    } catch (error) {
      console.error('Failed to load config', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showMessage('error', 'Only JSON files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `File uploaded successfully! ${data.songCount} songs found.`);
        await loadFiles();
      } else {
        showMessage('error', data.error || 'Upload failed');
      }
    } catch (error) {
      showMessage('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  });

  const handleDelete = async (filename: string) => {
    if (filename === activeFile) {
      showMessage('error', 'Cannot delete the currently active file');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    setDeleting(filename);
    try {
      const response = await fetch(`/api/admin/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'File deleted successfully');
        await loadFiles();
      } else {
        showMessage('error', data.error || 'Delete failed');
      }
    } catch (error) {
      showMessage('error', 'Delete failed. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetActive = async (filename: string) => {
    setActivating(filename);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeFile: filename }),
      });

      if (response.ok) {
        setActiveFile(filename);
        showMessage('success', `Active data source set to ${filename}`);
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Failed to set active file');
      }
    } catch (error) {
      showMessage('error', 'Failed to update configuration');
    } finally {
      setActivating(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                管理员控制台 | Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                管理赞美诗数据文件 | Manage praise songs data files
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新 | Refresh
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出 | Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            上传新文件 | Upload New File
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">上传中... | Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? '拖放文件到这里 | Drop the file here'
                    : '拖放 JSON 文件到这里，或点击选择 | Drop JSON file here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  仅支持 JSON 文件，最大 10MB | JSON files only, max 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              数据文件 | Data Files
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : files.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                暂无数据文件 | No data files found
              </p>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      file.name === activeFile 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className={`h-8 w-8 ${file.name === activeFile ? 'text-primary' : 'text-gray-400'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </h3>
                          {file.name === activeFile && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                              Current Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} • {formatDate(file.modified)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.name !== activeFile && (
                        <button
                          onClick={() => handleSetActive(file.name)}
                          disabled={activating === file.name}
                          className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
                        >
                          {activating === file.name ? 'Setting...' : 'Set Active'}
                        </button>
                      )}
                      
                      {file.name !== 'praisesongs_data.json' && file.name !== activeFile && (
                        <button
                          onClick={() => handleDelete(file.name)}
                          disabled={deleting === file.name}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="删除文件 | Delete file"
                        >
                          {deleting === file.name ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-primary hover:text-primary/600 text-sm"
          >
            返回首页 | Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
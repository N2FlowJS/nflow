
/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number = 0): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getTypeFile(mimetype?: string): string {
  switch (mimetype) {
    case 'application/pdf':
      return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'pptx';
    case 'application/vnd.ms-excel':
      return 'xls';
    case 'application/vnd.ms-powerpoint':
      return 'ppt';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.oasis.opendocument.text':
      return 'odt';
    case 'application/vnd.oasis.opendocument.spreadsheet':
      return 'ods';
    case 'application/vnd.oasis.opendocument.presentation':
      return 'odp';
    case 'application/epub+zip':
      return 'epub';
    case 'application/zip':
      return 'zip';
    case 'application/x-rar-compressed':
      return 'rar';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/bmp':
      return 'bmp';
    case 'image/webp':
      return 'webp';
    case 'image/tiff':
      return 'tiff';
    case 'image/svg+xml':
      return 'svg';
    case 'text/plain':
      return 'txt';
    case 'text/html':
      return 'html';
    case 'text/css':
      return 'css';
    case 'text/javascript':
      return 'js';
    case 'text/csv':
      return 'csv';
    case 'text/xml':
      return 'xml';
    case 'text/markdown':
      return 'md';
    case 'text/rtf':
      return 'rtf';
    case 'text/x-markdown':
      return 'md';
    case 'text/x-c':
      return 'c';
    case 'text/x-c++':
      return 'cpp';
    case 'text/x-python':
      return 'py';
    case 'text/x-java':
      return 'java';
    default:
      return 'unknown';
  }
}

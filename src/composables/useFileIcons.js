/**
 * Composable for mapping file extensions to Quasar Material Icons
 * @returns {Object} Object containing getFileIcon function
 */
export function useFileIcons() {
  /**
   * Get the appropriate Quasar Material Icon name for a file based on its extension
   * @param {string} fileName - The name of the file (with extension)
   * @returns {string} The Quasar Material Icon name
   */
  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
      return 'insert_drive_file';
    }

    // Extract file extension
    const extension = fileName.toLowerCase().split('.').pop();

    // Map extensions to icons
    const iconMap = {
      // PDF
      'pdf': 'picture_as_pdf',

      // Images
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'bmp': 'image',
      'svg': 'image',
      'webp': 'image',
      'ico': 'image',

      // Documents
      'doc': 'description',
      'docx': 'description',
      'txt': 'description',
      'rtf': 'description',
      'odt': 'description',

      // Spreadsheets
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'csv': 'table_chart',
      'ods': 'table_chart',

      // Presentations
      'ppt': 'slideshow',
      'pptx': 'slideshow',
      'odp': 'slideshow',

      // Archives
      'zip': 'folder_zip',
      'rar': 'folder_zip',
      '7z': 'folder_zip',
      'tar': 'folder_zip',
      'gz': 'folder_zip',

      // Code
      'js': 'code',
      'jsx': 'code',
      'ts': 'code',
      'tsx': 'code',
      'html': 'code',
      'css': 'code',
      'json': 'code',
      'xml': 'code',
      'py': 'code',
      'java': 'code',
      'cpp': 'code',
      'c': 'code',
      'php': 'code',
      'rb': 'code',
      'go': 'code',
      'rs': 'code',

      // Video
      'mp4': 'movie',
      'avi': 'movie',
      'mov': 'movie',
      'wmv': 'movie',
      'flv': 'movie',
      'mkv': 'movie',
      'webm': 'movie',

      // Audio
      'mp3': 'audio_file',
      'wav': 'audio_file',
      'flac': 'audio_file',
      'aac': 'audio_file',
      'ogg': 'audio_file',
      'wma': 'audio_file',
      'm4a': 'audio_file'
    };

    return iconMap[extension] || 'insert_drive_file';
  };

  /**
   * Get the appropriate icon for a folder
   * @returns {string} The Quasar Material Icon name for folders
   */
  const getFolderIcon = () => {
    return 'folder';
  };

  return {
    getFileIcon,
    getFolderIcon
  };
}

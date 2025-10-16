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

  /**
   * Get icon and color for file based on MIME type
   * @param {string} mimeType - The MIME type of the file
   * @returns {Object} Object with icon and color properties
   */
  const getIconForFile = (mimeType) => {
    if (!mimeType) {
      return { icon: 'insert_drive_file', color: 'grey-7' }
    }

    // Image files
    if (mimeType.startsWith('image/')) {
      return { icon: 'image', color: 'purple' }
    }

    // Video files
    if (mimeType.startsWith('video/')) {
      return { icon: 'movie', color: 'pink' }
    }

    // Audio files
    if (mimeType.startsWith('audio/')) {
      return { icon: 'audio_file', color: 'orange' }
    }

    // PDF
    if (mimeType.includes('pdf')) {
      return { icon: 'picture_as_pdf', color: 'red' }
    }

    // Word documents
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return { icon: 'description', color: 'blue' }
    }

    // Excel/Spreadsheets
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return { icon: 'table_chart', color: 'green' }
    }

    // PowerPoint/Presentations
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return { icon: 'slideshow', color: 'amber' }
    }

    // Archives
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) {
      return { icon: 'folder_zip', color: 'brown' }
    }

    // Text files
    if (mimeType.includes('text')) {
      return { icon: 'description', color: 'grey-8' }
    }

    // Default
    return { icon: 'insert_drive_file', color: 'grey-7' }
  }

  /**
   * Get icon and color for folder
   * @returns {Object} Object with icon and color properties
   */
  const getIconForFolder = () => {
    return { icon: 'folder', color: 'amber' }
  }

  return {
    getFileIcon,
    getFolderIcon,
    getIconForFile,
    getIconForFolder
  };
}

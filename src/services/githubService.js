// src/services/githubService.js
import axios from 'axios';

/**
 * Service for working with Excel files in a GitHub repository
 */
const githubService = {
  /**
   * Fetch a list of Excel files from a GitHub repository
   * 
   * @param {string} owner - GitHub username or organization
   * @param {string} repo - Repository name
   * @param {string} path - Path within the repository to search
   * @param {string} token - Optional GitHub personal access token for private repos
   * @returns {Promise<Array>} - Array of file metadata objects
   */
  async listExcelFiles(owner, repo, path = '', token = null) {
    try {
      const headers = token ? { Authorization: `token ${token}` } : {};
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      
      const response = await axios.get(url, { headers });
      
      // Filter for Excel files only
      const excelFiles = response.data.filter(file => 
        file.type === 'file' && 
        (file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls') || 
         file.name.endsWith('.xlsm') || 
         file.name.endsWith('.xlsb'))
      );
      
      return excelFiles.map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        sha: file.sha,
        downloadUrl: file.download_url
      }));
    } catch (error) {
      console.error('Error fetching Excel files from GitHub:', error);
      throw error;
    }
  },
  
  /**
   * Download an Excel file from GitHub
   * 
   * @param {string} fileUrl - GitHub download URL for the file
   * @param {string} token - Optional GitHub personal access token for private repos
   * @returns {Promise<ArrayBuffer>} - File content as ArrayBuffer
   */
  async downloadExcelFile(fileUrl, token = null) {
    try {
      const headers = token ? { Authorization: `token ${token}` } : {};
      
      const response = await axios.get(fileUrl, {
        headers,
        responseType: 'arraybuffer'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error downloading Excel file from GitHub:', error);
      throw error;
    }
  },
  
  /**
   * Upload or update an Excel file in the GitHub repository
   * 
   * @param {string} owner - GitHub username or organization
   * @param {string} repo - Repository name
   * @param {string} path - File path within the repository
   * @param {string} content - Base64 encoded file content
   * @param {string} message - Commit message
   * @param {string} sha - SHA of the file being replaced (only for updates)
   * @param {string} token - GitHub personal access token (required for writes)
   * @returns {Promise<Object>} - Result of the operation
   */
  async uploadExcelFile(owner, repo, path, content, message, sha = null, token) {
    if (!token) {
      throw new Error('GitHub token is required for uploading files');
    }
    
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const headers = { Authorization: `token ${token}` };
      
      const payload = {
        message,
        content, // Base64 encoded file content
        branch: 'main', // or your default branch
      };
      
      // If SHA is provided, it's an update operation
      if (sha) {
        payload.sha = sha;
      }
      
      const response = await axios.put(url, payload, { headers });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading Excel file to GitHub:', error);
      throw error;
    }
  },
  
  /**
   * Convert file to Base64 encoding for GitHub API
   * 
   * @param {File} file - File object to convert
   * @returns {Promise<string>} - Base64 encoded file content
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Get base64 string without metadata prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * Get file content as text
   * 
   * @param {ArrayBuffer} arrayBuffer - File content as ArrayBuffer
   * @returns {string} - File content as text
   */
  arrayBufferToText(arrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
  },
  
  /**
   * Test connection to GitHub repository
   * 
   * @param {string} owner - GitHub username or organization
   * @param {string} repo - Repository name
   * @param {string} token - Optional GitHub personal access token for private repos
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection(owner, repo, token = null) {
    try {
      const headers = token ? { Authorization: `token ${token}` } : {};
      const url = `https://api.github.com/repos/${owner}/${repo}`;
      
      await axios.get(url, { headers });
      return true;
    } catch (error) {
      console.error('Error testing GitHub connection:', error);
      return false;
    }
  }
};

export default githubService;
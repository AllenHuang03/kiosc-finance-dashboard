// src/components/GitHubConnector.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Description as FileIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Sync as SyncIcon,
  LockOpen as UnlockedIcon,
  Lock as LockedIcon
} from '@mui/icons-material';
import githubService from '../services/githubService';
import excelService from '../services/excelService';

const GitHubConnector = ({ onDataLoaded }) => {
  // Repository connection settings
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [token, setToken] = useState('');
  const [useToken, setUseToken] = useState(false);
  
  // UI state
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  // Dialog state
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  
  // Check for saved connection and load it
  useEffect(() => {
    const savedConnection = localStorage.getItem('githubConnection');
    if (savedConnection) {
      try {
        const { owner, repo, path, useToken } = JSON.parse(savedConnection);
        setOwner(owner);
        setRepo(repo);
        setPath(path || '');
        setUseToken(useToken || false);
        
        // Token is not saved in local storage for security reasons
        setShowTokenInput(useToken || false);
      } catch (err) {
        console.error('Error loading saved GitHub connection:', err);
      }
    }
  }, []);
  
  // Connect to GitHub repository
  const handleConnect = async () => {
    if (!owner || !repo) {
      setError('Please enter both repository owner and name');
      return;
    }
    
    setConnecting(true);
    setError(null);
    
    try {
      const actualToken = useToken ? token : null;
      const success = await githubService.testConnection(owner, repo, actualToken);
      
      if (success) {
        setConnected(true);
        setError(null);
        
        // Save connection settings (except token)
        localStorage.setItem('githubConnection', JSON.stringify({
          owner,
          repo,
          path,
          useToken
        }));
        
        // Load files
        await loadFiles();
      } else {
        setConnected(false);
        setError('Could not connect to the repository. Please check your settings.');
      }
    } catch (err) {
      setConnected(false);
      setError(`Connection error: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };
  
  // Load Excel files from the repository
  const loadFiles = async () => {
    if (!connected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const actualToken = useToken ? token : null;
      const excelFiles = await githubService.listExcelFiles(owner, repo, path, actualToken);
      setFiles(excelFiles);
    } catch (err) {
      setError(`Error loading files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle file selection
  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => {
      const fileIndex = prev.findIndex(f => f.name === file.name);
      if (fileIndex >= 0) {
        return prev.filter(f => f.name !== file.name);
      } else {
        return [...prev, file];
      }
    });
  };
  
  // Show file preview
  const handlePreview = async (file) => {
    setPreviewFile(file);
    setPreviewContent(null);
    setFilePreviewOpen(true);
    
    try {
      const actualToken = useToken ? token : null;
      const fileContent = await githubService.downloadExcelFile(file.downloadUrl, actualToken);
      
      // Preview as JSON for now
      setPreviewContent({
        type: 'excel',
        content: fileContent
      });
    } catch (err) {
      setPreviewContent({
        type: 'error',
        message: `Error loading file: ${err.message}`
      });
    }
  };
  
  // Close file preview dialog
  const handleClosePreview = () => {
    setFilePreviewOpen(false);
  };
  
  // Process selected files
  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one Excel file');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const actualToken = useToken ? token : null;
      
      // Download all selected files
      const downloadPromises = selectedFiles.map(file => 
        githubService.downloadExcelFile(file.downloadUrl, actualToken)
      );
      
      const fileContents = await Promise.all(downloadPromises);
      
      // Create Blob objects from the array buffers
      const fileBlobs = fileContents.map((content, index) => {
        const fileName = selectedFiles[index].name;
        return new File([content], fileName, { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      });
      
      // Map Excel data to application data model
      const appData = await excelService.mapExistingTemplates(fileBlobs);
      
      // Pass data back to parent component
      if (onDataLoaded) {
        onDataLoaded(appData);
      }
      
      setProcessing(false);
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
      setProcessing(false);
    }
  };
  
  // Toggle token usage
  const handleToggleUseToken = (event) => {
    const useToken = event.target.checked;
    setUseToken(useToken);
    setShowTokenInput(useToken);
    
    // Clear connection status when switching auth method
    setConnected(false);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Connect to GitHub Repository
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Import Excel files directly from a GitHub repository. For private repositories, 
        you'll need to provide a GitHub personal access token with read permissions.
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <GitHubIcon sx={{ mr: 2, mt: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              label="Repository Owner (username or organization)"
              variant="outlined"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              fullWidth
              margin="normal"
              disabled={connecting || loading || processing}
            />
            
            <TextField
              label="Repository Name"
              variant="outlined"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              fullWidth
              margin="normal"
              disabled={connecting || loading || processing}
            />
            
            <TextField
              label="Path (optional, leave empty for repository root)"
              variant="outlined"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              fullWidth
              margin="normal"
              disabled={connecting || loading || processing}
              placeholder="e.g. data/excel"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={useToken} 
                  onChange={handleToggleUseToken}
                  disabled={connecting || loading || processing}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {useToken ? <LockedIcon fontSize="small" sx={{ mr: 1 }} /> : <UnlockedIcon fontSize="small" sx={{ mr: 1 }} />}
                  {useToken ? "Using private repository (token required)" : "Using public repository"}
                </Box>
              }
            />
            
            {showTokenInput && (
              <TextField
                label="GitHub Personal Access Token"
                variant="outlined"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                fullWidth
                margin="normal"
                disabled={connecting || loading || processing}
                helperText="Token requires read access to the repository"
              />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={connecting || processing || !owner || !repo || (useToken && !token)}
            startIcon={connecting ? <CircularProgress size={20} /> : <GitHubIcon />}
          >
            {connecting ? 'Connecting...' : connected ? 'Reconnect' : 'Connect'}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {connected && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Excel Files
            </Typography>
            
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadFiles}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No Excel files found in the specified repository path.
            </Alert>
          ) : (
            <>
              <List>
                {files.map((file) => {
                  const isSelected = selectedFiles.some(f => f.name === file.name);
                  
                  return (
                    <ListItem 
                      key={file.path}
                      button
                      onClick={() => toggleFileSelection(file)}
                      selected={isSelected}
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name} 
                        secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Preview file">
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(file);
                            }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedFiles.length} of {files.length} files selected
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={handleProcessFiles}
                  disabled={selectedFiles.length === 0 || processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <SyncIcon />}
                >
                  {processing ? 'Processing...' : 'Process Selected Files'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
      
      {/* File Preview Dialog */}
      <Dialog
        open={filePreviewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewFile?.name}
        </DialogTitle>
        <DialogContent dividers>
          {!previewContent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewContent.type === 'error' ? (
            <Alert severity="error">
              {previewContent.message}
            </Alert>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Excel files can only be previewed after processing. Click "Download" to save the file locally.
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom>
                File Details:
              </Typography>
              <Typography variant="body2">
                Path: {previewFile?.path}
              </Typography>
              <Typography variant="body2">
                Size: {(previewFile?.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            disabled={!previewContent || previewContent.type === 'error'}
            onClick={() => {
              if (previewContent?.type === 'excel' && previewFile) {
                const blob = new Blob([previewContent.content], { 
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = previewFile.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GitHubConnector;
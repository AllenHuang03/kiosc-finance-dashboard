// src/components/TemplateGenerator.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  DownloadForOffline as DownloadIcon,
  Description as FileIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

// Template definitions
const templates = [
  {
    id: 'programs',
    name: 'Programs Template',
    description: 'Template for adding and managing program information',
    filename: 'KIOSC_Programs_Template.xlsx',
    sheets: [
      {
        name: 'Programs',
        headers: [
          'Name', 'Category', 'Budget', 'StartDate', 'EndDate', 'Description'
        ],
        sampleData: [
          ['Technology Outreach Program', 'VCES', 150000, '2024-01-01', '2025-12-31', 'Program for technology outreach'],
          ['STEM Curriculum Development', 'GDC', 75000, '2024-02-15', '2025-06-30', 'Development of STEM curriculum materials']
        ]
      }
    ]
  },
  {
    id: 'budget',
    name: 'Budget Tracking Template',
    description: 'Template for tracking program budget utilization',
    filename: 'KIOSC_Budget_Tracking_Template.xlsx',
    sheets: [
      {
        name: 'Budget_Tracking',
        headers: [
          'Program', 'TotalBudget', 'YTDExpenses', 'CommittedExpenses', 'YTDIncome', 'Notes'
        ],
        sampleData: [
          ['Technology Outreach Program', 150000, 45000, 30000, 160000, 'On track for Q2'],
          ['STEM Curriculum Development', 75000, 40000, 20000, 80000, 'Additional funding needed']
        ]
      }
    ]
  },
  {
    id: 'transactions',
    name: 'Transactions Template',
    description: 'Template for recording income and expense transactions',
    filename: 'KIOSC_Transactions_Template.xlsx',
    sheets: [
      {
        name: 'Transaction_Entry',
        headers: [
          'Date', 'Program', 'Type', 'AccountCategory', 'Amount', 'Status',
          'Reference', 'Description', 'Supplier', 'InvoiceDate', 'PaymentDueDate',
          'PaymentDate', 'PaymentStatus'
        ],
        sampleData: [
          [
            '2024-01-15', 'Technology Outreach Program', 'Income', 'VCES', 50000, 'Completed',
            'INV-2024-001', 'Initial funding payment', 'Swinburne University', '2024-01-10',
            '2024-02-10', '2024-01-30', 'Paid'
          ],
          [
            '2024-01-20', 'Technology Outreach Program', 'Expense', 'VCES', -15000, 'Completed',
            'PO-2024-001', 'Equipment purchase', 'Tech Solutions Inc.', '2024-01-18',
            '2024-02-18', '2024-02-15', 'Paid'
          ]
        ]
      }
    ]
  },
  {
    id: 'suppliers',
    name: 'Suppliers Template',
    description: 'Template for managing supplier information',
    filename: 'KIOSC_Suppliers_Template.xlsx',
    sheets: [
      {
        name: 'Suppliers',
        headers: [
          'Name', 'ContactPerson', 'Email', 'Phone', 'Address', 'Category', 'Notes'
        ],
        sampleData: [
          [
            'Tech Solutions Inc.', 'John Smith', 'john@techsolutions.com', '555-1234',
            '123 Tech St, Melbourne', 'Equipment', 'Preferred supplier for technical equipment'
          ],
          [
            'STEM Consultants', 'Sarah Johnson', 'sarah@stemconsultants.com', '555-5678',
            '456 Education Rd, Sydney', 'Services', 'Curriculum development specialists'
          ]
        ]
      }
    ]
  }
];

const TemplateGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Generate Excel template
  const generateTemplate = (template) => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add sheets
    template.sheets.forEach(sheet => {
      // Create header row
      const data = [sheet.headers];
      
      // Add sample data rows
      if (sheet.sampleData && sheet.sampleData.length > 0) {
        data.push(...sheet.sampleData);
      }
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Add some styling to header row (bold, background color)
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } }
        };
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    // Write workbook and trigger download
    XLSX.writeFile(wb, template.filename);
    
    // Show success message
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };
  
  // Show template preview dialog
  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };
  
  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Excel Templates
      </Typography>
      
      <Typography variant="body1" paragraph>
        Use these Excel templates to prepare your data for import into the KIOSC Finance System.
        Each template is designed to work with the specific data requirements of the system.
      </Typography>
      
      {downloadSuccess && (
        <Alert 
          severity="success" 
          icon={<CheckIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
        >
          Template downloaded successfully!
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={3} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<InfoIcon />}
                  onClick={() => handlePreview(template)}
                >
                  Preview
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => generateTemplate(template)}
                  color="primary"
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Template Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name} Preview
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Filename: {selectedTemplate.filename}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {selectedTemplate.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Included Sheets:
              </Typography>
              
              {selectedTemplate.sheets.map((sheet, index) => (
                <Box key={index} sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2">
                    Sheet: {sheet.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Headers:
                  </Typography>
                  
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <code>{sheet.headers.join(', ')}</code>
                  </Paper>
                  
                  {sheet.sampleData && sheet.sampleData.length > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                        Sample Data (first row):
                      </Typography>
                      
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5', overflowX: 'auto' }}>
                        <code>
                          {sheet.sampleData[0].map((cell, i) => (
                            <span key={i}>
                              <strong>{sheet.headers[i]}:</strong> {cell.toString()}
                              {i < sheet.sampleData[0].length - 1 ? <br /> : null}
                            </span>
                          ))}
                        </code>
                      </Paper>
                    </>
                  )}
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info">
                <AlertTitle>Template Usage</AlertTitle>
                <Typography variant="body2">
                  1. Download this template and open it in Microsoft Excel or another spreadsheet program.
                </Typography>
                <Typography variant="body2">
                  2. Fill in your data following the format shown in the sample rows.
                </Typography>
                <Typography variant="body2">
                  3. Save the file and import it into the KIOSC Finance System using the File Upload feature.
                </Typography>
              </Alert>
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
            onClick={() => {
              handleClosePreview();
              generateTemplate(selectedTemplate);
            }}
          >
            Download Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateGenerator;
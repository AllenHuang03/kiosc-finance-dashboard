// src/services/excelService.js
import * as XLSX from 'xlsx';

// Helper function to extract data from Excel files
const extractExcelData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          cellStyles: true
        });
        
        // Process each worksheet in the workbook
        const result = {};
        
        workbook.SheetNames.forEach(sheetName => {
          // Convert the sheet to JSON
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            dateNF: 'yyyy-mm-dd',
            defval: '' // Default value for empty cells
          });
          
          // Store the data under the sheet name
          result[sheetName] = jsonData;
        });
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Error processing Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Map Excel data to application data model
const mapExcelToAppData = (excelData) => {
  // Initialize the app data structure
  const appData = {
    Programs: [],
    Budget_Tracking: [],
    Transaction_Entry: [],
    Suppliers: []
  };
  
  // Map data from Excel sheets to app data model
  try {
    // Process Programs data
    if (excelData['Programs']) {
      appData.Programs = excelData['Programs'].map((row, index) => ({
        id: index + 1,
        name: row.Name || `Program ${index + 1}`,
        category: row.Category || 'Uncategorized',
        budget: parseFloat(row.Budget) || 0,
        startDate: row.StartDate || new Date().toISOString().split('T')[0],
        endDate: row.EndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      }));
    }
    
    // Process Budget Tracking data
    if (excelData['Budget_Tracking']) {
      appData.Budget_Tracking = excelData['Budget_Tracking'].map(row => {
        const totalBudget = parseFloat(row.TotalBudget) || 0;
        const ytdExpenses = parseFloat(row.YTDExpenses) || 0;
        const committedExpenses = parseFloat(row.CommittedExpenses) || 0;
        const availableBudget = totalBudget - ytdExpenses - committedExpenses;
        const percentUsed = totalBudget > 0 ? (ytdExpenses + committedExpenses) / totalBudget : 0;
        
        // Determine status based on percentage used
        let status = 'On Track';
        if (percentUsed > 0.9) {
          status = 'At Risk';
        } else if (percentUsed > 0.7) {
          status = 'Caution';
        }
        
        return {
          program: row.Program || 'Unknown Program',
          totalBudget,
          ytdExpenses,
          committedExpenses,
          availableBudget,
          percentUsed,
          status,
          ytdIncome: parseFloat(row.YTDIncome) || 0
        };
      });
    }
    
    // Process Transaction Entry data
    if (excelData['Transaction_Entry']) {
      appData.Transaction_Entry = excelData['Transaction_Entry'].map((row, index) => ({
        id: index + 1,
        date: row.Date || new Date().toISOString().split('T')[0],
        program: row.Program || 'Unknown Program',
        type: row.Type || 'Expense',
        accountCategory: row.AccountCategory || 'Uncategorized',
        amount: parseFloat(row.Amount) || 0,
        status: row.Status || 'Pending',
        reference: row.Reference || '',
        description: row.Description || '',
        supplier: row.Supplier || '',
        invoiceDate: row.InvoiceDate || '',
        paymentDueDate: row.PaymentDueDate || '',
        paymentDate: row.PaymentDate || '',
        paymentStatus: row.PaymentStatus || 'Unpaid'
      }));
    }
    
    // Process Suppliers data
    if (excelData['Suppliers']) {
      appData.Suppliers = excelData['Suppliers'].map((row, index) => ({
        id: index + 1,
        name: row.Name || `Supplier ${index + 1}`,
        contactPerson: row.ContactPerson || '',
        email: row.Email || '',
        phone: row.Phone || '',
        address: row.Address || '',
        category: row.Category || 'General',
        notes: row.Notes || ''
      }));
    }
    
    return appData;
  } catch (error) {
    console.error('Error mapping Excel data to app data:', error);
    throw error;
  }
};

// Handle custom mapping for existing Excel templates
const mapExistingTemplates = (files) => {
  return new Promise(async (resolve, reject) => {
    try {
      const appData = {
        Programs: [],
        Budget_Tracking: [],
        Transaction_Entry: [],
        Suppliers: []
      };
      
      // Process each file
      for (const file of files) {
        const excelData = await extractExcelData(file);
        
        // Handle Revenue Terms template
        if (file.name.includes('Revenue_Terms')) {
          // Map revenue data to Programs
          const revenueSheet = Object.values(excelData)[0]; // Assuming first sheet contains revenue data
          
          // Process revenue data...
          // (Custom mapping logic here)
        }
        
        // Handle Expenditure Tracker
        else if (file.name.includes('Expenditure')) {
          // Map expenditure data to Transactions and Budget Tracking
          // (Custom mapping logic here)
        }
        
        // Handle LDI Budget Template
        else if (file.name.includes('Budget')) {
          // Map budget data
          // (Custom mapping logic here)
        }
        
        // Handle Suppliers sheet
        else if (file.name.includes('Suppliers')) {
          const suppliersData = Object.values(excelData)[0];
          appData.Suppliers = suppliersData.map((row, index) => ({
            id: index + 1,
            name: row['Supplier Name'] || `Supplier ${index + 1}`,
            contactPerson: row['Contact Person'] || '',
            email: row['Email'] || '',
            phone: row['Phone'] || '',
            address: row['Address'] || '',
            category: row['Category'] || 'General',
            notes: row['Notes'] || ''
          }));
        }
      }
      
      resolve(appData);
    } catch (error) {
      reject(error);
    }
  });
};

// Export Excel data
const exportToExcel = (data, fileName = 'export.xlsx') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Add each data set as a separate worksheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      if (Array.isArray(sheetData) && sheetData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });
    
    // Write the workbook and trigger download
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Generate mock data for development
const getMockData = () => {
  return {
    Programs: [
      {
        id: 1,
        name: "Technology Outreach Program",
        category: "VCES",
        budget: 150000,
        startDate: "2024-01-01",
        endDate: "2025-12-31"
      },
      {
        id: 2,
        name: "STEM Curriculum Development",
        category: "GDC",
        budget: 75000,
        startDate: "2024-02-15",
        endDate: "2025-06-30"
      },
      {
        id: 3,
        name: "School Partnership Initiative",
        category: "Commercial",
        budget: 120000,
        startDate: "2024-03-01",
        endDate: "2025-08-31"
      },
      {
        id: 4,
        name: "Innovation Workshop Series",
        category: "Operations",
        budget: 45000,
        startDate: "2024-04-15",
        endDate: "2025-04-14"
      },
      {
        id: 5,
        name: "Digital Literacy Program",
        category: "VCES",
        budget: 90000,
        startDate: "2024-05-01",
        endDate: "2025-10-31"
      }
    ],
    Budget_Tracking: [
      {
        program: "Technology Outreach Program",
        totalBudget: 150000,
        ytdExpenses: 45000,
        committedExpenses: 30000,
        availableBudget: 75000,
        percentUsed: 0.5,
        status: "On Track",
        ytdIncome: 160000
      },
      {
        program: "STEM Curriculum Development",
        totalBudget: 75000,
        ytdExpenses: 40000,
        committedExpenses: 20000,
        availableBudget: 15000,
        percentUsed: 0.8,
        status: "Caution",
        ytdIncome: 80000
      },
      {
        program: "School Partnership Initiative",
        totalBudget: 120000,
        ytdExpenses: 80000,
        committedExpenses: 30000,
        availableBudget: 10000,
        percentUsed: 0.92,
        status: "At Risk",
        ytdIncome: 125000
      },
      {
        program: "Innovation Workshop Series",
        totalBudget: 45000,
        ytdExpenses: 10000,
        committedExpenses: 5000,
        availableBudget: 30000,
        percentUsed: 0.33,
        status: "On Track",
        ytdIncome: 50000
      },
      {
        program: "Digital Literacy Program",
        totalBudget: 90000,
        ytdExpenses: 30000,
        committedExpenses: 15000,
        availableBudget: 45000,
        percentUsed: 0.5,
        status: "On Track",
        ytdIncome: 92000
      }
    ],
    Transaction_Entry: [
      {
        id: 1,
        date: "2024-01-15",
        program: "Technology Outreach Program",
        type: "Income",
        accountCategory: "VCES",
        amount: 50000,
        status: "Completed",
        reference: "INV-2024-001",
        description: "Initial funding payment",
        supplier: "Swinburne University",
        invoiceDate: "2024-01-10",
        paymentDueDate: "2024-02-10",
        paymentDate: "2024-01-30",
        paymentStatus: "Paid"
      },
      {
        id: 2,
        date: "2024-01-20",
        program: "Technology Outreach Program",
        type: "Expense",
        accountCategory: "VCES",
        amount: -15000,
        status: "Completed",
        reference: "PO-2024-001",
        description: "Equipment purchase",
        supplier: "Tech Solutions Inc.",
        invoiceDate: "2024-01-18",
        paymentDueDate: "2024-02-18",
        paymentDate: "2024-02-15",
        paymentStatus: "Paid"
      },
      {
        id: 3,
        date: "2024-02-05",
        program: "STEM Curriculum Development",
        type: "Income",
        accountCategory: "GDC",
        amount: 40000,
        status: "Completed",
        reference: "INV-2024-002",
        description: "First installment",
        supplier: "Education Department",
        invoiceDate: "2024-02-01",
        paymentDueDate: "2024-03-01",
        paymentDate: "2024-02-25",
        paymentStatus: "Paid"
      },
      {
        id: 4,
        date: "2024-02-18",
        program: "STEM Curriculum Development",
        type: "Expense",
        accountCategory: "GDC",
        amount: -18000,
        status: "Completed",
        reference: "PO-2024-002",
        description: "Consultant fees",
        supplier: "STEM Consultants",
        invoiceDate: "2024-02-15",
        paymentDueDate: "2024-03-15",
        paymentDate: "",
        paymentStatus: "Pending"
      },
      {
        id: 15,
        date: "2024-06-01",
        program: "School Partnership Initiative",
        type: "Income",
        accountCategory: "Commercial",
        amount: 40000,
        status: "Completed",
        reference: "INV-2024-007",
        description: "Second installment",
        supplier: "School District",
        invoiceDate: "2024-05-28",
        paymentDueDate: "2024-06-28",
        paymentDate: "",
        paymentStatus: "Outstanding"
      }
    ],
    Suppliers: [
      {
        id: 1,
        name: "Tech Solutions Inc.",
        contactPerson: "John Smith",
        email: "john@techsolutions.com",
        phone: "555-1234",
        address: "123 Tech St, Melbourne",
        category: "Equipment",
        notes: "Preferred supplier for technical equipment"
      },
      {
        id: 2,
        name: "STEM Consultants",
        contactPerson: "Sarah Johnson",
        email: "sarah@stemconsultants.com",
        phone: "555-5678",
        address: "456 Education Rd, Sydney",
        category: "Services",
        notes: "Curriculum development specialists"
      },
      {
        id: 3,
        name: "Office Supplies Co.",
        contactPerson: "Michael Wong",
        email: "michael@officesupplies.com",
        phone: "555-9012",
        address: "789 Business Ave, Brisbane",
        category: "Supplies",
        notes: "Standard office supplies vendor"
      }
    ],
    // Dashboard data for summary statistics
    Dashboard: {
      financialSummary: {
        totalIncome: 290000,
        totalExpenses: 168000,
        netPosition: 122000
      },
      accountCategorySummary: [
        {
          category: "VCES",
          income: 110000,
          expenses: 60000,
          netPosition: 50000
        },
        {
          category: "GDC",
          income: 80000,
          expenses: 58000,
          netPosition: 22000
        },
        {
          category: "Commercial",
          income: 100000,
          expenses: 50000,
          netPosition: 50000
        }
      ],
      invoiceStatus: [
        { status: 'Paid', value: 120000 },
        { status: 'Outstanding', value: 45000 },
        { status: 'Overdue', value: 15000 }
      ],
      recentTransactions: [
        {
          date: "2024-05-20",
          program: "Digital Literacy Program",
          type: "Expense",
          amount: -15000,
          status: "Completed",
          paymentStatus: "Paid"
        },
        {
          date: "2024-05-15",
          program: "Technology Outreach Program",
          type: "Income",
          amount: 30000,
          status: "Completed",
          paymentStatus: "Paid"
        },
        {
          date: "2024-05-10",
          program: "Innovation Workshop Series",
          type: "Expense",
          amount: -7000,
          status: "Completed",
          paymentStatus: "Paid"
        },
        {
          date: "2024-05-01",
          program: "Digital Literacy Program",
          type: "Income",
          amount: 45000,
          status: "Completed",
          paymentStatus: "Paid"
        },
        {
          date: "2024-04-20",
          program: "School Partnership Initiative",
          type: "Expense",
          amount: -18000,
          status: "Completed",
          paymentStatus: "Pending"
        }
      ]
    }
  };
};

// Public API
const excelService = {
  extractExcelData,
  mapExcelToAppData,
  mapExistingTemplates,
  exportToExcel,
  getMockData
};

export default excelService;
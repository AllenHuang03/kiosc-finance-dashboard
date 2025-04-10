// src/services/ExcelIntegration.js
import * as XLSX from 'xlsx';

class ExcelIntegration {
  constructor() {
    this.data = null;
    this.filename = 'KIOSC_Finance_Data.xlsx';
  }

  // Initialize with mock data if needed
  initialize() {
    // Sample mock data structure
    if (!this.data) {
      this.data = {
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
            supplier: "Swinburne University"
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
            supplier: "Tech Solutions Inc."
          }
        ]
      };
    }
    return this.data;
  }

  // Load data from Excel file
  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Process workbook sheets
          const result = {};
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            result[sheetName] = jsonData;
          });
          
          this.data = result;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Save data to Excel file
  saveToFile() {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Add each data array as a worksheet
      Object.entries(this.data).forEach(([sheetName, data]) => {
        if (Array.isArray(data) && data.length > 0) {
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
      });
      
      // Write the workbook and trigger download
      XLSX.writeFile(wb, this.filename);
      return true;
    } catch (error) {
      console.error('Error saving to Excel:', error);
      return false;
    }
  }

  // Add a transaction
  addTransaction(transaction) {
    if (!this.data.Transaction_Entry) {
      this.data.Transaction_Entry = [];
    }
    
    // Generate ID if not provided
    if (!transaction.id) {
      const maxId = this.data.Transaction_Entry.reduce(
        (max, t) => Math.max(max, t.id || 0), 0
      );
      transaction.id = maxId + 1;
    }
    
    this.data.Transaction_Entry.push(transaction);
    return transaction;
  }

  // Add a budget
  addBudget(budget) {
    if (!this.data.Budget_Tracking) {
      this.data.Budget_Tracking = [];
    }
    
    // Check if budget for this program already exists
    const existingIndex = this.data.Budget_Tracking.findIndex(
      b => b.program === budget.program
    );
    
    if (existingIndex >= 0) {
      // Update existing budget
      this.data.Budget_Tracking[existingIndex] = {
        ...this.data.Budget_Tracking[existingIndex],
        ...budget
      };
      return this.data.Budget_Tracking[existingIndex];
    } else {
      // Add new budget
      this.data.Budget_Tracking.push(budget);
      return budget;
    }
  }

  // Get all data
  getAllData() {
    return this.data || this.initialize();
  }

  // Get programs
  getPrograms() {
    return this.data?.Programs || [];
  }

  // Get budget tracking data
  getBudgetTracking() {
    return this.data?.Budget_Tracking || [];
  }

  // Get transactions
  getTransactions() {
    return this.data?.Transaction_Entry || [];
  }
}

// Create a singleton instance
const excelIntegration = new ExcelIntegration();

export default excelIntegration;
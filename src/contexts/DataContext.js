// src/contexts/DataContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import excelIntegration from '../services/ExcelIntegration';

// Create context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from Excel integration
  const loadData = async () => {
    setLoading(true);
    try {
      const excelData = excelIntegration.getAllData();
      setData(excelData);
      setError(null);
    } catch (err) {
      setError("Error loading data: " + err.message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a transaction
  const addTransaction = (transaction) => {
    try {
      // Add transaction to Excel data
      const newTransaction = excelIntegration.addTransaction(transaction);
      
      // Update state
      setData(prevData => ({
        ...prevData,
        Transaction_Entry: [
          ...(prevData.Transaction_Entry || []),
          newTransaction
        ]
      }));
      
      // Save to Excel file
      excelIntegration.saveToFile();
      
      return true;
    } catch (err) {
      setError("Error adding transaction: " + err.message);
      console.error("Error adding transaction:", err);
      return false;
    }
  };

  // Add or update a budget
  const addBudget = (budget) => {
    try {
      // Add budget to Excel data
      const newBudget = excelIntegration.addBudget(budget);
      
      // Update state
      setData(prevData => {
        const exists = prevData.Budget_Tracking?.some(b => b.program === budget.program);
        
        if (exists) {
          // Update existing budget
          return {
            ...prevData,
            Budget_Tracking: prevData.Budget_Tracking.map(b => 
              b.program === budget.program ? newBudget : b
            )
          };
        } else {
          // Add new budget
          return {
            ...prevData,
            Budget_Tracking: [
              ...(prevData.Budget_Tracking || []),
              newBudget
            ]
          };
        }
      });
      
      // Save to Excel file
      excelIntegration.saveToFile();
      
      return true;
    } catch (err) {
      setError("Error adding budget: " + err.message);
      console.error("Error adding budget:", err);
      return false;
    }
  };

  // Get unique categories from programs
  const getCategories = () => {
    if (!data || !data.Programs) return [];
    
    const categories = new Set(
      data.Programs.map(program => program.category).filter(Boolean)
    );
    
    return Array.from(categories);
  };

  // Export data to Excel file
  const exportToExcel = () => {
    try {
      excelIntegration.saveToFile();
      return true;
    } catch (err) {
      setError("Error exporting to Excel: " + err.message);
      console.error("Error exporting to Excel:", err);
      return false;
    }
  };

  // Import data from Excel file
  const importFromExcel = async (file) => {
    setLoading(true);
    try {
      const importedData = await excelIntegration.loadFromFile(file);
      setData(importedData);
      setError(null);
      return true;
    } catch (err) {
      setError("Error importing from Excel: " + err.message);
      console.error("Error importing from Excel:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    data,
    loading,
    error,
    loadData,
    addTransaction,
    addBudget,
    getCategories,
    exportToExcel,
    importFromExcel
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
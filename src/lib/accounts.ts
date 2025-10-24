// Chart of Accounts data and utilities
export interface Account {
  code: string;
  name: string;
  balance: number;
  description?: string;
}

export interface AccountCategory {
  name: string;
  color: string;
  accounts: Account[];
}

// Base accounts data
const baseAccounts: Record<string, AccountCategory> = {
  assets: {
    name: "Assets",
    color: "text-primary",
    accounts: [
      { code: "1010", name: "Cash in Hand", balance: 45000 },
      { code: "1020", name: "Bank - Current Account", balance: 235000 },
      { code: "1030", name: "Bank - Savings Account", balance: 150000 },
      { code: "1100", name: "Accounts Receivable", balance: 15430 },
      { code: "1040", name: "UPI Receivables", balance: 8500 },
      { code: "1200", name: "Inventory", balance: 234560 },
      { code: "1500", name: "Vehicle", balance: 450000 },
      { code: "1510", name: "Equipment", balance: 85000 },
    ]
  },
  liabilities: {
    name: "Liabilities",
    color: "text-destructive",
    accounts: [
      { code: "2010", name: "Accounts Payable", balance: 28100 },
      { code: "2020", name: "Salary Payable", balance: 0 },
      { code: "2100", name: "Loan - Vehicle", balance: 200000 },
    ]
  },
  equity: {
    name: "Equity",
    color: "text-success",
    accounts: [
      { code: "3010", name: "Owner's Capital", balance: 800000 },
      { code: "3020", name: "Retained Earnings", balance: 146890 },
    ]
  },
  income: {
    name: "Income",
    color: "text-success",
    accounts: [
      { code: "4010", name: "Direct Sales", balance: 95430 },
      { code: "4020", name: "Sales - Cart", balance: 30000 },
      { code: "4100", name: "Other Income", balance: 4500 },
      { code: "4110", name: "Commission Income", balance: 3000 },
      { code: "4120", name: "Rent Income", balance: 5000 },
      { code: "4130", name: "Scrap Sale Income", balance: 1500 },
    ]
  },
          expenses: {
            name: "Expenses",
            color: "text-destructive",
            accounts: [
              { code: "5010", name: "Cost of Goods Sold", balance: 55000 },
              { code: "5100", name: "Fuel Expense", balance: 2500 },
              { code: "5110", name: "Salary Expense", balance: 15000 },
              { code: "5120", name: "Rent Expense", balance: 8000 },
              { code: "5130", name: "Maintenance Expense", balance: 4500 },
              { code: "5140", name: "Damage/Loss", balance: 1200 },
            ]
          }
};

// Load accounts from localStorage with fallback to base accounts
export const loadAccounts = (): Record<string, AccountCategory> => {
  try {
    const storedAccounts = localStorage.getItem("chartOfAccounts");
    if (storedAccounts) {
      return JSON.parse(storedAccounts);
    }
  } catch (error) {
    console.error("Error loading accounts from localStorage:", error);
  }
  return baseAccounts;
};

// Save accounts to localStorage
export const saveAccounts = (accounts: Record<string, AccountCategory>) => {
  try {
    localStorage.setItem("chartOfAccounts", JSON.stringify(accounts));
  } catch (error) {
    console.error("Error saving accounts to localStorage:", error);
  }
};

// Generate unique account code based on category
export const generateAccountCode = (category: string): string => {
  const categoryPrefixes: Record<string, string> = {
    assets: "1",
    liabilities: "2", 
    equity: "3",
    income: "4",
    expenses: "5"
  };
  
  const prefix = categoryPrefixes[category] || "9";
  const existingAccounts = getAllAccounts();
  const categoryCodes = existingAccounts
    .filter(acc => acc.code.startsWith(prefix))
    .map(acc => parseInt(acc.code))
    .sort((a, b) => b - a);
  
  // Find the next available code
  let nextCode = parseInt(prefix + "000") + 10; // Start from next 10
  if (categoryCodes.length > 0) {
    nextCode = categoryCodes[0] + 10;
  }
  
  return nextCode.toString();
};

// Check if an account code is unique across all categories
export const isAccountCodeUnique = (code: string): boolean => {
  const existing = getAllAccounts();
  return !existing.some(acc => acc.code === code);
};

// Validate a proposed account code for a given category
export const validateAccountCode = (
  category: string,
  code: string
): { valid: boolean; message?: string } => {
  const categoryPrefixes: Record<string, string> = {
    assets: "1",
    liabilities: "2",
    equity: "3",
    income: "4",
    expenses: "5"
  };

  if (!code || !/^\d+$/.test(code)) {
    return { valid: false, message: "Code must be numeric." };
  }

  const expectedPrefix = categoryPrefixes[category];
  if (expectedPrefix && !code.startsWith(expectedPrefix)) {
    return { valid: false, message: `Code must start with ${expectedPrefix} for this category.` };
  }

  if (!isAccountCodeUnique(code)) {
    return { valid: false, message: "This code is already in use." };
  }

  return { valid: true };
};

// Add new account
export const addAccount = (account: Account, category: string) => {
  const currentAccounts = loadAccounts();
  if (currentAccounts[category]) {
    currentAccounts[category].accounts.push(account);
    saveAccounts(currentAccounts);
  }
};

// Update existing account
export const updateAccount = (oldCode: string, updatedAccount: Account, category: string) => {
  const currentAccounts = loadAccounts();
  if (currentAccounts[category]) {
    const accountIndex = currentAccounts[category].accounts.findIndex(acc => acc.code === oldCode);
    if (accountIndex !== -1) {
      currentAccounts[category].accounts[accountIndex] = updatedAccount;
      saveAccounts(currentAccounts);
    }
  }
};

// Update account and move to a new category if needed
export const updateOrMoveAccount = (
  oldCode: string,
  updatedAccount: Account,
  oldCategory: string,
  newCategory: string
) => {
  const currentAccounts = loadAccounts();

  // If category did not change, behave like update
  if (oldCategory === newCategory) {
    return updateAccount(oldCode, updatedAccount, oldCategory);
  }

  if (!currentAccounts[oldCategory] || !currentAccounts[newCategory]) {
    return;
  }

  // Remove from old category
  currentAccounts[oldCategory].accounts = currentAccounts[oldCategory].accounts.filter(
    acc => acc.code !== oldCode
  );

  // Add to new category (append at end)
  currentAccounts[newCategory].accounts.push(updatedAccount);

  saveAccounts(currentAccounts);
};

// Check if account has journal entries
export const hasJournalEntries = (accountName: string): boolean => {
  try {
    const journalEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    return journalEntries.some(entry => 
      entry.lines.some(line => line.account === accountName)
    );
  } catch (error) {
    console.error("Error checking journal entries:", error);
    return false;
  }
};

// Delete account (with safety check)
export const deleteAccount = (code: string, category: string): { success: boolean; message: string } => {
  const currentAccounts = loadAccounts();
  const account = getAccountByCode(code);
  
  if (!account) {
    return { success: false, message: "Account not found" };
  }
  
  if (hasJournalEntries(account.name)) {
    return { 
      success: false, 
      message: `Cannot delete account "${account.name}" because it has journal entries. Consider renaming it instead.` 
    };
  }
  
  if (currentAccounts[category]) {
    currentAccounts[category].accounts = currentAccounts[category].accounts.filter(acc => acc.code !== code);
    saveAccounts(currentAccounts);
    return { success: true, message: `Account "${account.name}" deleted successfully` };
  }
  
  return { success: false, message: "Category not found" };
};

// Rename account
export const renameAccount = (code: string, newName: string, category: string): { success: boolean; message: string } => {
  const currentAccounts = loadAccounts();
  const account = getAccountByCode(code);
  
  if (!account) {
    return { success: false, message: "Account not found" };
  }
  
  if (currentAccounts[category]) {
    const accountIndex = currentAccounts[category].accounts.findIndex(acc => acc.code === code);
    if (accountIndex !== -1) {
      currentAccounts[category].accounts[accountIndex].name = newName;
      saveAccounts(currentAccounts);
      return { success: true, message: `Account renamed to "${newName}" successfully` };
    }
  }
  
  return { success: false, message: "Failed to rename account" };
};

// Mark account as inactive (soft delete)
export const deactivateAccount = (code: string, category: string): { success: boolean; message: string } => {
  const currentAccounts = loadAccounts();
  const account = getAccountByCode(code);
  
  if (!account) {
    return { success: false, message: "Account not found" };
  }
  
  if (currentAccounts[category]) {
    const accountIndex = currentAccounts[category].accounts.findIndex(acc => acc.code === code);
    if (accountIndex !== -1) {
      // Add (INACTIVE) suffix to indicate it's deactivated
      currentAccounts[category].accounts[accountIndex].name = `${account.name} (INACTIVE)`;
      saveAccounts(currentAccounts);
      return { success: true, message: `Account "${account.name}" marked as inactive` };
    }
  }
  
  return { success: false, message: "Failed to deactivate account" };
};

// Mark account as active (remove inactive status)
export const activateAccount = (code: string, category: string): { success: boolean; message: string } => {
  const currentAccounts = loadAccounts();
  const account = getAccountByCode(code);
  
  if (!account) {
    return { success: false, message: "Account not found" };
  }
  
  if (currentAccounts[category]) {
    const accountIndex = currentAccounts[category].accounts.findIndex(acc => acc.code === code);
    if (accountIndex !== -1) {
      // Remove (INACTIVE) suffix to indicate it's active
      const currentName = currentAccounts[category].accounts[accountIndex].name;
      const cleanName = currentName.replace(/ \(INACTIVE\)$/, '');
      currentAccounts[category].accounts[accountIndex].name = cleanName;
      saveAccounts(currentAccounts);
      return { success: true, message: `Account "${cleanName}" marked as active` };
    }
  }
  
  return { success: false, message: "Failed to activate account" };
};

// Get all accounts as a flat array
export const getAllAccounts = (): Account[] => {
  const currentAccounts = loadAccounts();
  return Object.values(currentAccounts).flatMap(category => category.accounts);
};

// Get accounts by category
export const getAccountsByCategory = (category: string): Account[] => {
  const currentAccounts = loadAccounts();
  return currentAccounts[category]?.accounts || [];
};

// Get account by code
export const getAccountByCode = (code: string): Account | undefined => {
  return getAllAccounts().find(account => account.code === code);
};

// Get payment method accounts
export const getPaymentMethodAccounts = (): Account[] => {
  return [
    { code: "1010", name: "Cash in Hand", balance: 45000 },
    { code: "1020", name: "Bank - Current Account", balance: 235000 },
    { code: "1030", name: "Bank - Savings Account", balance: 150000 },
    { code: "1100", name: "Accounts Receivable", balance: 15430 },
    { code: "1040", name: "UPI Receivables", balance: 8500 },
    { code: "2010", name: "Accounts Payable", balance: 28100 },
  ];
};

// Get income accounts
export const getIncomeAccounts = (): Account[] => {
  return getAccountsByCategory('income');
};

// Get expense accounts
export const getExpenseAccounts = (): Account[] => {
  return getAccountsByCategory('expenses');
};

// Get asset accounts
export const getAssetAccounts = (): Account[] => {
  return getAccountsByCategory('assets');
};
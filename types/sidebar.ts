export type CurrentUser = {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
};

export type AccountOption = {
  account_id: number;
  name: string;
  balance: number;
  currency: string;
};

export type CategoryOption = {
  category_id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
};

export type TransactionForm = {
  amount: number;         
  description: string;    
  date: string;           
  isPersonal: boolean;    
  accountId: number;     
  categoryId: number;     
  tags: string[];         
};

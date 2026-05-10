
import React from "react";
import { Icon } from '@iconify/react';

function slidebar() {

  return (
    <div className=" h-screen bg-gray-100 p-4 border border-gray-300 rounded-lg">
      <div className="flex items-center gap-4 p-4 ">
        <div>
          <img src="/assets/logo.png" alt="logo" className="w-10" />
        </div>
        <div >
          <h1 className="text-2xl font-bold">My Family-App</h1>
          <p className="text-sm text-gray-500">ชื่อผู้ใช้</p>
        </div>
      </div>
      <div className="gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
        <button  className="flex items-center gap-2">
          <Icon icon="lucide:plus" width="20" height="20" />
          <p>Transactions</p>
        </button>
      </div>
      <div>
        <ul className="mt-4 space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
            <Icon icon="material-symbols:dashboard" width="24" height="24" />
            <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
            Dashboard
          </a>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
            <Icon icon="material-symbols:account-balance" width="24" height="24" />
            <a href="/transactions" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
              Transactions
            </a>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
            <Icon icon="material-symbols:credit-card" width="24" height="24" />
            <a href="/accounts" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
              Accounts
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
}

export default slidebar;

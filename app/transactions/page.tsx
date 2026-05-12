import React from "react";
import Slidebar from "../../components/slidebar";
import TransactionsPage from "../../components/transactions/transactionsPage";

function page() {
  return (
    <div className="min-h-screen">
      <div className="flex gap-6 xl:gap-8 ">
        <aside className="w-auto shrink-0">
          <Slidebar />
        </aside>
        <main className="w-full py-6 pr-2">
          <div className="mx-auto max-w-350">
            <TransactionsPage />
          </div>
        </main>
      </div>
    </div>
  );
}

export default page;

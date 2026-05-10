import React from "react";
import Slidebar from "../../components/slidebar";

function page() {
  return (
    <div>
      <div className="flex gap-10">
        <aside>
          <Slidebar />
        </aside>
        <main>
          <h1>Dashboard</h1>
          <p>ยินดีต้อนรับเข้าสู่แดชบอร์ดของคุณ!</p>
        </main>
      </div>
    </div>
  );
}

export default page;

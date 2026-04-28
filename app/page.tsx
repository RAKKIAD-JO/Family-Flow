import Image from "next/image";
import Aside from "@/components/slidebar"


export default function Home() {
  return (
   <div className=" ">
    <header>
      <p className="text-2xl text-blue-600 ">รายรับ-รายจ่าย Me&Family</p>
    </header>
      <Aside/>
    <section>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto voluptatibus odio ipsa nobis ducimus, blanditiis recusandae quam rem minus neque culpa commodi voluptate a molestias fugiat adipisci in quaerat dolore.</p>
    </section>
    
   </div>
  );
}

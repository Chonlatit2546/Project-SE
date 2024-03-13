import Navbar from "../components/Navbar";
import React, { useState } from 'react';
import "./css/Receipt.css";

function CreateReceipt(){

   const [OrderData, setOrderData] = useState(null);
   const [items, setItems] = useState([
      
      {
         itemNumber: 1,
         Description:'pen',
         quantity: 4.00,
         unit: 'Pcs.',
         unitPrice: 10.00
      },
      
      {
         itemNumber: 2,
         Description:'pencil',
         quantity: 6.00,
         unit: 'Pcs.',
         unitPrice: 10.00
      },

      {
         itemNumber: 3,
         Description:'book',
         quantity: 7.00,
         unit: 'Pcs.',
         unitPrice: 10.00
      },
      {
         itemNumber: 4,
         Description:'notebook',
         quantity: 8.00,
         unit: 'Pcs.',
         unitPrice: 30.00
      },
      ]);
   
      const updateTotal = () => {
         let total = 0;
         items.forEach(item => {
           total += item.quantity * item.unitPrice;
         });
     
         return total.toFixed(2);
      };
      
      const vat = (updateTotal() * 0.07).toFixed(2);
      const grand_total = (parseFloat(updateTotal()) + parseFloat(vat)).toFixed(2);

   return (
      
      <>
         <Navbar/>

         <div className="main">
            <h1>Create Receipt</h1>

            <div className="status">

               <div className="PO">
                  <h2>PO</h2>
               </div>

               <div className="Receipt">
                  <h2>Receipt</h2>
               </div>

               <div className="Cheque-Only-Cleared">
                  <h2>Cheque Only Cleared</h2>
               </div>



            </div>

            < div className="Quotation">
               <p className="p1">Quotation</p>
               <p className="p2">Refer To</p>
               <p className="PO-ID">PO211458-652341</p>
               <p className ="p3">Receipt No.</p>

               <div className="Re-No">
                  <p>RE02264-00100</p>
                  <p className="p2">*</p>
               </div>

               
                <p className="p4">lssued Date</p>
                <p className="d">24/12/2024</p>
               



            </div>

            <div className="customer">
                <p className="p1">Customer</p>

                <div className="cus-data">

                  <p className="p2">Customer Name</p>
                  <p className="Name">Somsak</p>
                  <p className="p3">Department</p>
                  <p className="Department">Warehouse</p>
                  <p className="p4">Email</p>
                  <p className="Email">gokit54@gmail.com</p>
                  <p className="p5">Customer Address</p>
                  <p className="address">Thailand..............................................................</p>
                  <p className="p6">Phone Number</p>
                  <p className="phone">059-624-5236</p>
                </div>
                


            </div>

            <div className="item">
               <div className="name-colume">
                <p className="p1">Item</p>
                <p className="p2">Description</p>
                <p className="p3">Quantity</p>
                <p className="p4">Unit</p>
                <p className="p5">Unit Price</p>
                <p className="p6">Amount</p>
               </div>

               {items.map(item => (
                  <div key={item.itemNumber} className="item-row">
                     <p className="i1">{item.itemNumber}</p>
                     <p className="i2">{item.Description}</p>
                     <p className="i3">{item.quantity}</p>
                     <p className="i4">{item.unit}</p>
                     <p className="i5">{item.unitPrice}</p>
                     <p className="i6">{(item.quantity * item.unitPrice).toFixed(2)}</p>
                  </div>
               ))}
            </div>

            
            <div className="summary">
               <p className="p1">Summary</p>
               <p className ="total">Total<span className="tab"></span>{updateTotal()} THB</p>
               <p className ="vat">Vat 7%<span className="tab2"></span>{vat} THB</p>

               <p className="grand-total">Grand Total<span className="tab"></span>{grand_total} THB</p>
            </div>

            <button className="cancel">Cancel</button>
            <button className="save-a-draft">Save a Draft</button>
            <button className="approve-receipt">Approve Receipt</button>
         </div>
      </>
      
       
    );
 }
 
 export default CreateReceipt;
import React, { useState, useEffect } from 'react';
import { Link , useParams } from 'react-router-dom';
import { collection, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

function Quotation() {
   const { username } = useParams();
   const [quotations, setQuotations] = useState([]);
 
   useEffect(() => {
     const fetchQuotations = async () => {
       try {
         const quotationQuery = query(collection(db, 'quotation'));
         const querySnapshot = await getDocs(quotationQuery);
         const quotationData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setQuotations(quotationData);
       } catch (error) {
         console.error('Error fetching quotations:', error);
       }
     };
 
     fetchQuotations();
   }, [username]);
 
   // Function to calculate grand total
   const calculateGrandTotal = (items) => {
      let total = 0;
      if (items) { // Add null check here
        items.forEach((item) => {
          total += item.quantity * item.unitPrice;
        });
      }
      return total.toFixed(2);
    };
 
   return (
     <div>
       <h1>Quotation</h1>
       <br />
       <Link to={`/Createquotation/${username}`}>
         <button>Create Quotation</button>
       </Link>
       <br />
       <br />
       <table>
         <thead>
           <tr>
             <th>Quotation No.</th>
             <th>Customer Name</th>
             <th>Issued Date</th>
             <th>Expired Date</th>
             <th>Grand Total</th>
             <th>Quotation Status</th>
           </tr>
         </thead>
         <tbody>
           {quotations.map(quotation => (
             <tr key={quotation.id}>
               <td>{quotation.id}</td>
               <td>{quotation.cusName}</td>
               <td>{quotation.issuedDate}</td>
               <td>{quotation.expiredDate}</td>
               <td>{calculateGrandTotal(quotation.items)}</td>
               <td>{quotation.quotationStatus}</td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   );
 }
 
 export default Quotation;
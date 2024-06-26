import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, deleteDoc, getDocs, collection, setDoc, updateDoc, documentId } from 'firebase/firestore';
import './css/ApproveReceipt.css';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { Button } from 'bootstrap';


function ApproveReceipt() {
   const { id } = useParams();
   const [productPOData, setProductPOData] = useState(null);
   const [receiptData, setreceiptData] = useState(null);
   const [po, setpo] = useState(null);
   const [quotationData, setQuotationData] = useState();
   const [productData, setProductData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [total, setTotal] = useState(0);
   const [vat, setVat] = useState(0);
   const [grandTotal, setGrandTotal] = useState(0);
   const [menuActive, setMenuActive] = useState(true);
   const [status, setStatus] = useState('');
   const [isApproved, setIsApproved] = useState(false);
   const [ShowConfirmModal, setShowConfirmModal] = useState(false);
   
   


///fetch data from data base/////////////////////////
 useEffect(() => {
   const fetchQuotationAndProductPOData = async () => {
     try {
        //fetch data receipt table from id
       const reDocRef = doc(db, 'receipt', id);
       const reSnapshot = await getDoc(reDocRef);

       if (!reSnapshot.exists()) {
         throw new Error('PO document does not exist');
       }

       const reData = reSnapshot.data();
       setreceiptData(reData);
       
       //fetch data po table
       const poDocRef = reData.POref;
       const poSnapshot = await getDoc(poDocRef);

       if (!poSnapshot.exists()) {
         throw new Error('PO document does not exist');
       }

       const poData = { id: poDocRef.id, ...poSnapshot.data() };
       setpo(poData);

       //fetch data productPO table
       const productPODocRef = poData.productPO;
       const productPOSnapshot = await getDoc(productPODocRef);

       if (!productPOSnapshot.exists()) {
         throw new Error('Product PO document does not exist');
       }

       const productPOData = { id: productPODocRef.id, ...productPOSnapshot.data() };
       setProductPOData(productPOData);

       //fetch data quotation table
       const quotationNoRef = productPOData.quotationNo;
       const quotationNoDoc = await getDoc(quotationNoRef);

       if (!quotationNoDoc.exists()) {
         throw new Error('Quotation document does not exist');
       }

       const quotationNoData = { id: quotationNoRef.id, ...quotationNoDoc.data() };
       setQuotationData(quotationNoData);

       //each item in productPO table
       const productDataPromises = Object.values(productPOData)
         .filter(product => typeof product === 'object' && product.description)
         .map(async (product) => {
           const productDocRef = product.description;
           const productDocSnapshot = await getDoc(productDocRef);
           if (productDocSnapshot.exists()) {
             return { id: productDocRef.id, ...productDocSnapshot.data() };
           }
           return null;
         });

       const resolvedProductData = await Promise.all(productDataPromises);
       setProductData(resolvedProductData);

       setLoading(false);
     } catch (error) {
       console.error('Error fetching data: ', error);
       setError(error);
       setLoading(false);
     }
   };

   fetchQuotationAndProductPOData();
 }, [id]);

 ///calculate amount for each item////////////////////////
 useEffect(() => {
   if (productData.length > 0) {
     const calculatedTotal = productData.reduce((acc, product, index) => {
       const productNo = `productNo${index + 1}`;
       return acc + productPOData[productNo].quantity * productPOData[productNo].unitPrice;
     }, 0);
     setTotal(calculatedTotal.toFixed(2));

     const calculatedVat = calculatedTotal * 0.07;
     setVat(calculatedVat.toFixed(2));

     const calculatedGrandTotal = calculatedTotal + calculatedVat;
     setGrandTotal(calculatedGrandTotal.toFixed(2));
   }
 }, [productData, productPOData]);

 
 /////set first status/////////////////////////////////////// 
 useEffect(() => {
   if (receiptData) {
     setStatus(receiptData.status);
     setIsApproved(po.status === 'On Hold');
   }
 }, [po]);

 ///handle accept receipt button 
 const handleAccept = async () => {
    try {
      setStatus('Waiting for Response'); // Optimistically update the status
      setIsApproved(true);
      await updateDoc(doc(db, 'receipt', id), {status: 'Closed' });
      const reid = receiptData.id;
      const poreff = receiptData.POref.id;
      await updateDoc(doc(db, 'po', poreff), {status: 'Closed' });
      setIsApproved(false);
      alert('Receipt accepted successfully.');
      window.location.href = `/ReceiptDetail/${id}`;
    } catch (error) {
      console.error('Error approving receipt:', error);
      // Revert the state if the operation fails
      setStatus(receiptData.status);
      setIsApproved(receiptData.status === 'Waiting for Response');
    }
  };

  
  //-----------------------------คำสั่งปุ่ม Draft-----------------------------
 const handleDraft = async () => {
    try {
      
      await updateDoc(doc(db, 'receipt', id), {status: 'On Hold' });
      window.location.href = '/SearchReceipt';
      
    
    } catch (error) {
      console.error('Error approving receipt:', error);
      // Revert the state if the operation fails
      setStatus(receiptData.status);
      setIsApproved(receiptData.status === 'On Hold');
    }
  };

  //------------------------------คำสั่งปุ่มยกเลิกใบเสร็จ------------------------------
  const handleCancel = () => {
    setShowConfirmModal(true);
  };
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmDelete = async () => {
    // Delete the receipt data in Firebase
    try{

      await deleteDoc(doc(db, 'receipt', id));
        
      const poreff = receiptData.POref.id;
      await updateDoc(doc(db, 'po', poreff), {status: 'Waiting for receipt creation' });
      console.log('Receipt deleted successfully!');
      window.location.href = `/SearchReceipt`;
    }catch(error){

    }
        
      
    
    setShowConfirmModal(false);
  };

  
  

 
  


//--------------------------ปุ่มย้อนกลับ----------------------------------------------------------
 const handleGoBack = () => {
   window.location.href = '/SearchReceipt';
 };
 
 //--------------------------HTML--------------------------------------------------------------------
 return (
   <div class="main-content">
   <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
 <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
 {quotationData ? (
   <>
     <div className="header">
           <button className="back-btn" onClick={handleGoBack}>&lt;</button>
           <h1>Receipt - {id}</h1>
         </div>
         <div className="button-container">
           
         <button className="cancel-btn1" onClick={handleCancel}>
          Cancel Receipt
        </button>

        
            <div className='approval-container3'>
              <div className="footer">
               {status === 'On Hold'  ? (
                 <>
                    <button className="create-btn" onClick={handleAccept}>Accept Receipt</button>
                 
                 </>
               ) : (
               status !== 'On Hold' && (
               ' '
               )
               )}
            </div>
         </div>
           
         </div>
         <div className="quotation-details6">
           <h2>Receipt No. {id}</h2>
           <p>------------------------------------------------------------------------------------------------------------------------------------------------------</p>
           <p><span className="custom-c">๐ {receiptData.status}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; 
           <span className="custom-colors">Refer To: {po.id} &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Issued Date: {receiptData.issuedDate} &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
            </span>
           </p>
            <p>------------------------------------------------------------------------------------------------------------------------------------------------------</p>
           <h3>Customer</h3>
           <p>
             <strong className="custom-color">Customer Name:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusName}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;
             <strong className="custom-color">Department:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusDepartment || "-"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
             <strong className="custom-color">Email:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusEmail || "-"}</span><br />
             <br /><strong className="custom-color">Customer Address:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusAddress || "-"}</span><br />
             <br /><strong className="custom-color">Phone Number:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusPhoneNo}</span>
           </p>
           <p>------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <table>
             <thead>
               <tr>
                 <th className="custom-color">Item No.&nbsp;&nbsp;&nbsp;</th>
                 <th className="custom-color">&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;Description&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;</th>
                 <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quantity</th>
                 <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unit</th>
                 <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unit Price</th>
                 <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Amount</th>
               </tr>
             </thead>
             <tbody>
             <br />
               {productData.map((product, index) => (
                 <tr key={index}>
                   <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{index + 1}</td>
                   <td className="custom-colors">{product.productName}&nbsp; ({product.color})<br />
                     Material: {product.material}
                   </td>
                   <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{productPOData[`productNo${index + 1}`].quantity}</td>
                   <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{product.unit}</td>
                   <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{productPOData[`productNo${index + 1}`].unitPrice}</td>
                   <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{(productPOData[`productNo${index + 1}`].quantity * productPOData[`productNo${index + 1}`].unitPrice).toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
           <p>------------------------------------------------------------------------------------------------------------------------------------------------------</p>
           <h3>Summary</h3>
           <div className="part1">
           <p>
             <strong className="custom-color">Total:</strong> <span className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{total} &nbsp;&nbsp;&nbsp;THB</span><br />
             <br /><strong className="custom-color">VAT (7%):</strong> <span className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{vat} &nbsp;&nbsp;&nbsp;THB</span><br />
           </p>
           </div>
           <div className="part2">
           <div className="grand-total">Grand Total: {grandTotal} ฿</div>
           </div>
           <div className="part3">
              <div className="payment-details">
                <h3 className="custom-color">Payment</h3>
                  <p>
                    <strong className="custom-colors">Payment: &nbsp;&nbsp;&nbsp;Paying by cheque</strong> {/* Payment term value */}<br />
                    <strong className="custom-colors">Payment Term: &nbsp;&nbsp;&nbsp;60 DAYS FROM END OF RECEIPT MONTH</strong> {/* Payment details */}
                  </p>
              </div>
            </div>
            {ShowConfirmModal && (
          <div className="confirm-modal">
            <p className='confirm-text'>Are you sure you want to delete this receipt?</p>
            <button className='confirmDe-btn' onClick={handleConfirmDelete}>Confirm</button>
            <button className='notconfirmDe-btn' onClick={handleCancelDelete}>Cancel</button>
          </div>
        )}
         </div>
         
         <div className='approval-container4'>
            <div className="footer">
               {status === 'On Hold'  ? (
                 <>
                    <button className="draft-btn" onClick={handleDraft}>Save a Draft</button>
                 
                 </>
               ) : (
               status !== 'On Hold' && (
               ' '
               )
               )}
            </div>
         </div>
       </>
     ) : (
        <div class="loader"></div>
     )}
   </div>
   </div>
 );
}
 
 export default ApproveReceipt;
                  
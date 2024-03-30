import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, deleteDoc, getDocs, collection, setDoc, updateDoc, documentId } from 'firebase/firestore';
import './css/Receipt.css';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { PDFDownloadLink } from '@react-pdf/renderer';
import FormPDF from './FormPDF';
import PurchaseOrderPDF from './PurchaseOrderPDF'

function CreateReceipt() {
   const { id } = useParams();
   const [productPOData, setProductPOData] = useState(null);
   const [po, setpo] = useState(null);
   const [quotationData, setQuotationData] = useState();
   const [productData, setProductData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [total, setTotal] = useState(0);
   const [vat, setVat] = useState(0);
   const [grandTotal, setGrandTotal] = useState(0);
   const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
   const [receiptToDelete, setreceiptToDelete] = useState(null);
   const [menuActive, setMenuActive] = useState(true);
   const [status, setStatus] = useState('');
   const [isApproved, setIsApproved] = useState(false);
   const [documentIdValue, setDocumentIdValue] = useState('');
   const [poDocumentName, setPoDocumentName] = useState('');



 useEffect(() => {
   const fetchQuotationAndProductPOData = async () => {
     try {
       const poDocRef = doc(db, 'po', id);
       const poSnapshot = await getDoc(poDocRef);

       if (!poSnapshot.exists()) {
         throw new Error('PO document does not exist');
       }

       const poData = poSnapshot.data();
       setpo(poData);

       const productPODocRef = poData.productPO;
       const productPOSnapshot = await getDoc(productPODocRef);

       if (!productPOSnapshot.exists()) {
         throw new Error('Product PO document does not exist');
       }

       const productPOData = { id: productPODocRef.id, ...productPOSnapshot.data() };
       setProductPOData(productPOData);

       const quotationNoRef = productPOData.quotationNo;
       const quotationNoDoc = await getDoc(quotationNoRef);

       if (!quotationNoDoc.exists()) {
         throw new Error('Quotation document does not exist');
       }

       const quotationNoData = { id: quotationNoRef.id, ...quotationNoDoc.data() };
       setQuotationData(quotationNoData);

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

 
 useEffect(() => {
   if (po) {
     setStatus(po.status);
     setIsApproved(po.status === 'Waiting for receipt creation');
   }
 }, [po]);

 

 const handlecreateReceipt = async () => {
   try {
     await updateDoc(doc(db,'po', id), { status: 'Closed' });
     setStatus('Closed');
     setIsApproved(true); 
     alert('Receipt created successfully.');
     const currentDate = new Date();
     const formattedCurrentDate = currentDate.toISOString().split('T')[0];
     const expiredDate = new Date(currentDate.getTime() + 32 * 24 * 60 * 60 * 1000);
     const formattedExpiredDate = expiredDate.toISOString().split('T')[0];

     const querySnapshot = await getDocs(collection(db, 'receipt'));
     const nextReceiptNo = querySnapshot.size
     let maxReceiptNo = 0;
      querySnapshot.forEach(doc => {
        const currentReceiptNo = parseInt(doc.id.substr(3)); // Extract the numeric part of the quotation number
          if (currentReceiptNo > maxReceiptNo) {
            maxReceiptNo = currentReceiptNo;
          }
      });
     const documentId = `rec${String(maxReceiptNo+1).padStart(4, '0')}`;
     setDocumentIdValue(documentId);
     const poref = doc(db, 'po', id);
     const receiptData = {
       POref: poref,
       issuedDate: formattedCurrentDate,
       status: 'Waiting for Response',
       
     };
     
     await setDoc(doc(db, 'receipt', documentId), receiptData);
     window.location.href = '/Purchaseorder';
     
   } catch (error) {
     console.error('Error updating status and creating receipt:', error);
   }
 };

 const handleCancel = async () => {
   const confirmCancel = window.confirm("Are you sure you want to cancel this purchase order?");

   if (confirmCancel) {
     await deleteDoc(doc(db, 'po', id));
     const productPORef = po.productPO.id;
     await deleteDoc(doc(db, 'productPO', productPORef));
     const quotationRef = quotationData.id;
     await deleteDoc(doc(db, 'quotation', quotationRef));
     window.location.href = '/Purchaseorder';
   } 
 };


 const handleGoBack = () => {
   window.location.href = '/Purchaseorder';
 };
 
 return (
   <div class="main-content">
   <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
 <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
 {quotationData ? (
   <>
     <div className="header">
           <button className="back-btn" onClick={handleGoBack}>&lt;</button>
           <h1>Purchase Order - {id}</h1>
         </div>
         <div className="button-container">
           <PDFDownloadLink
             className="download-btn"
             document={<PurchaseOrderPDF
               purchaseOrderID={id}
               purchaseOrderData={po}
               quotationData={quotationData}
               productData={productData}
               productPOData={productPOData}
               total={total}
               vat={vat}
               grandTotal={grandTotal}
             />}
             fileName={`PurchaseOrder_${id}.pdf`}
           >
             {({ blob, url, loading, error }) =>
               loading ? 'Loading document...' : 'Download'
             }
           </PDFDownloadLink>
           <div className="options-dropdown">
             <button className="options-btn">Options</button>
             <div className="options-dropdown-content">
               {status === 'Waiting for receipt creation' && (
                  <div >

                     <Link to={`/Editquotation/${quotationData.id}`} className="options-btn edit-btn">Edit Quotation</Link>
                     <button onClick={() => handleCancel} className="options-btn cancel-btn">Cancel Purchase Order</button>
                  </div>

                   
               )}
             </div>
           </div>
         </div>
         <div className="quotation-details">
           <h2>Purchase Order No. {id}</h2>
           <p>------------------------------------------------------------------------------------------------------------------------------------------------------</p>
           <p><span className="custom-c">๐ {po.status}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; 
           <span className="custom-colors">Refer To: {quotationData.id} &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Issued Date: {po.issuedDate} &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
            Expired Date: {po.expiredDate}</span>
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
         </div>
         <div className='approval-container2'>
            <div className="footer">
               {status === 'Waiting for receipt creation' ? (
                  <button className="create-btn" onClick={handlecreateReceipt}>CreateReceipt</button>
               ) : (
               status !== 'Waiting for receipt creation' && (
               ' '
               )
               )}
            </div>
         </div>
       </>
     ) : (
       <div>Loading...</div>
     )}
   </div>
   </div>
 );
}
 
 export default CreateReceipt;
                  
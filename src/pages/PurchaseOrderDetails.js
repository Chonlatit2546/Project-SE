import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import './css/PurchaseOrderDetails.css';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { PDFDownloadLink } from '@react-pdf/renderer';
import PurchaseOrderPDF from './PurchaseOrderPDF';

function PurchaseOrderDetails() {
    const { id } = useParams();
    const [purchaseOrderData, setPurchaseOrderData] = useState(null);
    const [productPOData, setProductPOData] = useState(null);
    const [quotationData, setQuotationData] = useState();
    const [productData, setProductData] = useState([]);
    const [menuActive, setMenuActive] = useState(true);
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [isApproved, setIsApproved] = useState(false);
    const [status, setStatus] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchPurchaseOrderData = async () => {
          try {
              const purchaseOrderDocRef = doc(db, 'po', id);
              const purchaseOrderDocSnapshot = await getDoc(purchaseOrderDocRef);
  
              if (!purchaseOrderDocSnapshot.exists()) {
                  throw new Error('Purchase Order document does not exist');
              }
  
              const purchaseOrderData = purchaseOrderDocSnapshot.data();
              setPurchaseOrderData(purchaseOrderData);
  
              // Fetch productPO data
              const productPORef = purchaseOrderData.productPO;
              const productPODocSnapshot = await getDoc(productPORef);
              if (!productPODocSnapshot.exists()) {
                  throw new Error('Product PO document does not exist');
              }
              const productPOData = productPODocSnapshot.data();
              setProductPOData(productPOData);
  
              // Fetch quotation data
              const quotationRef = productPOData.quotationNo;
              const quotationDocSnapshot = await getDoc(quotationRef);
              if (!quotationDocSnapshot.exists()) {
                  throw new Error('Quotation document does not exist');
              }
              const quotationData = { id: quotationRef.id, ...quotationDocSnapshot.data() };
              console.log(quotationData);
              setQuotationData(quotationData);
  
              // Fetch product data
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
  
      fetchPurchaseOrderData();
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
  const handleCreateReceipt = () => {
    window.location.href = `/CreateReceipt/${id}`;
  };
  console.log(productPOData)
  console.log(quotationData)
  const handleCancel = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this purchase order?");

    if (confirmCancel) {
      await deleteDoc(doc(db, 'po', id));
      const productPORef = purchaseOrderData.productPO.id;
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
    <div className="main-content">
      <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
        <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : purchaseOrderData ? (
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
                purchaseOrderData={purchaseOrderData}
                quotationData={quotationData}
                productData={productData}
                productPOData={productPOData}
                total={total}
                vat={vat}
                grandTotal={grandTotal}
              />}
              fileName={`purchaseorder_${id}.pdf`}
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download'
              }
            </PDFDownloadLink>
            <button onClick={handleCancel} className="Cancel-btn">Cancel PO</button>
          </div>
            <div className="purchase-order-details">
              <h2>Purchase Order No. {id}</h2><br />
              <p>----------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
              <p><span className="custom-c">๐ {purchaseOrderData.status}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; 
            <span className="custom-colors">Refer To: {quotationData.id} &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
             Issued Date: {quotationData.issuedDate} &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
             Expired Date: {quotationData.expiredDate}</span>
              </p>
              <p>----------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
              <br /><h3>Customer</h3>
            <br />
            <p>
              <strong className="custom-color">Customer Name:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusName}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;
              <strong className="custom-color">Department:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusDepartment || "-"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong className="custom-color">Email:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusEmail || "-"}</span><br />
              <br /><strong className="custom-color">Customer Address:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusAddress || "-"}</span><br />
              <br /><strong className="custom-color">Phone Number:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusPhoneNo}</span>
            </p>
            <p>----------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <table>
              <thead><br />
                <tr>
                  <th className="custom-color">Item No.&nbsp;&nbsp;&nbsp;</th>
                  <th className="custom-color">&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;Description&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;</th>
                  <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quantity</th>
                  <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unit</th>
                  <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unit Price</th>
                  <th className="custom-color">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Amount</th>
                </tr>
              </thead><br />
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
              <p>----------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
              <br /><h3>Summary</h3><br />
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
              <h3 className="custom-color">Payment</h3><br />
              <p>
              <strong className="custom-colors">Payment: &nbsp;&nbsp;&nbsp;Paying by cheque</strong> <br /><br />
              <strong className="custom-colors">Payment Term: &nbsp;&nbsp;&nbsp;60 DAYS FROM END OF RECEIPT MONTH</strong> 
              </p>
              </div>
              </div>
          </div>
          <div className='approval-container'>
          <div className="footer">
            {status === 'Waiting for receipt creation' && (
              <button className="CreateReceipt-btn" onClick={handleCreateReceipt}>Create Receipt</button>
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

export default PurchaseOrderDetails;

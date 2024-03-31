import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, deleteDoc, getDocs, collection, setDoc, updateDoc, documentId } from 'firebase/firestore';
import './css/QuotationDetails.css';
import { db } from '../firebase'; 
import Navbar from "../components/Navbar";
import { PDFDownloadLink } from '@react-pdf/renderer';
import FormPDF from './FormPDF';
import Editquotation from './Editquotation'; 

function QuotationDetails() {
  const { id } = useParams();
  const [productPOData, setProductPOData] = useState(null);
  const [quotationData, setQuotationData] = useState();
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [menuActive, setMenuActive] = useState(true);
  const [status, setStatus] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [poDocumentName, setPoDocumentName] = useState('');

  useEffect(() => {
    const fetchQuotationAndProductPOData = async () => {
      try {
        const productPODocRef = doc(db, 'productPO', id);
        const productPOSnapshot = await getDoc(productPODocRef);
  
        if (!productPOSnapshot.exists()) {
          throw new Error('Product PO document does not exist');
        }
  
        const productPOData = productPOSnapshot.data();
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
        const poId = quotationNoData.poId;
        const poDoc = await getDoc(poId);
        console.log(poDoc.id);
        if (!poDoc.exists()) {
          throw new Error('PO document does not exist');
        }
        setPoDocumentName(poDoc.id);
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

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this purchase order?");
    if (confirmCancel) {
      await deleteDoc(doc(db, 'productPO', id));
      const quotationRef = quotationData.id;
      await deleteDoc(doc(db, 'quotation', quotationRef));
    }
  };

  
  useEffect(() => {
    if (quotationData) {
      setStatus(quotationData.status);
      setIsApproved(quotationData.status === 'Waiting for Response');
    }
  }, [quotationData]);

  const handleApproved = async () => {
    try {
      setStatus('Waiting for Response'); 
      setIsApproved(true);
      await updateDoc(doc(db, 'quotation', quotationData.id), {status: 'Waiting for Response' });
      setIsApproved(false);
      alert('Quotation approved successfully.');
    } catch (error) {
      console.error('Error approving quotation:', error);
      setStatus(quotationData.status);
      setIsApproved(quotationData.status === 'Waiting for Response');
    }
  };
    const handleAccepted = async () => {
      try {
        await updateDoc(doc(db, 'quotation', quotationData.id), { status: 'Waiting for receipt creation' });
        setStatus('Waiting for receipt creation');
        setIsApproved(true); 
        alert('Quotation accepted successfully.');
        console.log(quotationData.status);
        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toISOString().split('T')[0];
        const expiredDate = new Date(currentDate.getTime() + 32 * 24 * 60 * 60 * 1000);
        const formattedExpiredDate = expiredDate.toISOString().split('T')[0];
    
        const querySnapshot = await getDocs(collection(db, 'po'));
        let maxPONo = 0;
        querySnapshot.forEach(doc => {
        const currentPONo = parseInt(doc.id.substr(3)); 
        if (currentPONo > maxPONo) {
          maxPONo = currentPONo;
        }
        });
        const documentId = `pud${String(maxPONo+1).padStart(4, '0')}`;
        const productPODocRef = doc(db, 'productPO', id);
        setPoDocumentName(poDocumentName);
        const purchaseOrderData = {
          expiredDate: formattedExpiredDate,
          issuedDate: formattedCurrentDate,
          productPO: productPODocRef ,
          status: 'Waiting for receipt creation',
        };
        const poRef = doc(db, 'po', documentId);
        await setDoc(doc(db, 'po', documentId), purchaseOrderData);
        await updateDoc(doc(db, 'quotation', quotationData.id), { poId: poRef });
        window.location.href = `/PurchaseOrderDetails/${documentId}`;
      } catch (error) {
        console.error('Error updating status and creating purchase order:', error);
      }
    };
    
    const handleGoBack = () => {
        window.location.href = '/quotation';
    };
    const handleEdit = () => {
      console.log(id)
      console.log(productPOData)
      const productPOId = id;
      return (
        <Editquotation
          productPOId={productPOId}
          quotationData={quotationData} 
          productPOData={productPOData}
        />
      );
    };
  return (
    <div class="main-content">
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
  <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
  {quotationData ? (
    <>
      <div className="header">
            <button className="back-btn" onClick={handleGoBack}>&lt;</button>
            <h1>Quotations - {quotationData.id}</h1>
          </div>
          <div className="button-container">
            <PDFDownloadLink
              className="download-btn5"
              document={<FormPDF
                quotationData={quotationData}
                productData={productData}
                productPOData={productPOData}
                total={total}
                vat={vat}
                grandTotal={grandTotal}
              />}
              fileName={`quotation_${quotationData.id}.pdf`}
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download'
              }
            </PDFDownloadLink>
            <div className="options-dropdown">
              <button className="options-btn5">Options</button>
              <div className="options-dropdown-content">
              {(!isApproved && status === 'Pending Approval') && (
                <Link to={`/Editquotation/${id}`} className="options-btn edit-btn">Edit Quotation</Link>
              )}<button onClick={handleCancel} className="options-btn cancel-btn">Cancel Quotation</button>
              </div>
            </div>
            </div>
          <div className="quotation-details5">
            <h2>Quotation No. {quotationData.id}</h2><br />
            <p>-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
            <p><span className="custom-c">๐ {status}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp; 
            <span className="custom-colors">Refer To: {poDocumentName} &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
             Issued Date: {quotationData.issuedDate} &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
             Expired Date: {quotationData.expiredDate}</span>
            </p>
             <p>-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
             <br /><h3>Customer</h3>
            <br />
            <p>
              <strong className="custom-color">Customer Name:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusName}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp;
              <strong className="custom-color">Department:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusDepartment || "-"}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong className="custom-color">Email:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusEmail || "-"}</span><br />
              <br /><strong className="custom-color">Customer Address:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusAddress || "-"}</span><br />
              <br /><strong className="custom-color">Phone Number:</strong> &nbsp;&nbsp;&nbsp;<span className="custom-colors">{quotationData.cusPhoneNo}</span>
            </p>
            <p>-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
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
                    <td value={product.id}className="custom-colors">{`${product.productName}, (${product.color}), Material: ${product.material ? product.material + ', ' : ''} Size: ${product.size ? product.size : ''}`}
                    </td>
                    <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{productPOData[`productNo${index + 1}`].quantity}</td>
                    <td value={product.id} className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{product.unit}</td>
                    <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{productPOData[`productNo${index + 1}`].unitPrice}</td>
                    <td className="custom-colors">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{(productPOData[`productNo${index + 1}`].quantity * productPOData[`productNo${index + 1}`].unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</p>
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
          {!isApproved && status !== 'Waiting for Response' && status !== 'Waiting for receipt creation'&& status !== 'On Hold'&& status !== 'Closed' ? (
            <button className="Approve-btn" onClick={handleApproved}>Approve</button>
          ) : (
            status !== 'Waiting for receipt creation' && status !== 'On Hold'&& status !== 'Closed' && (
            <button className="Accept-btn" onClick={handleAccepted}>Accept</button>
            )
          )}
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
    </div>
  );
}
export default QuotationDetails;

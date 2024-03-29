import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import { DataGrid } from "@mui/x-data-grid";
import Navbar from "../components/Navbar";
import './css/Quotation.css'; 

function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuActive, setMenuActive] = useState(true);
  const [storedUsername, setStoredUsername] = useState('');
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setStoredUsername(storedUsername);
    }
    console.log("Username in Homew:", storedUsername);
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const quotationSnapshot = await getDocs(collection(db, 'productPO'));

        const quotationData = [];
        await Promise.all(quotationSnapshot.docs.map(async doc => {
          const data = doc.data();
          const quotationNoRef = data.quotationNo;
          if (!quotationNoRef) {
            throw new Error('Quotation reference is null or undefined');
          }
          const quotationNoId = quotationNoRef.id;
          console.log('quotationNoId:', quotationNoId);

          const quotationNoDoc = await getDoc(quotationNoRef);
          if (!quotationNoDoc.exists()) {
            throw new Error('Quotation document does not exist');
          }
          const quotationNoData = quotationNoDoc.data();
          console.log('quotationNoData:', quotationNoData);

          let grandTotal = 0;
          Object.keys(data).forEach(key => {
            if (key.startsWith('productNo')) {
              const product = data[key];
              const subtotalProduct = product.quantity * product.unitPrice;
              grandTotal += subtotalProduct;
              console.log('qNoData:', product);
            }
          });

          const vat = 0.07;
          grandTotal *= 1 + vat;

          const quotation = {
            id: doc.id,
            quotationNo: quotationNoId,
            cusName: quotationNoData.cusName,
            issuedDate: quotationNoData.issuedDate,
            expiredDate: quotationNoData.expiredDate, 
            grandTotal: grandTotal.toFixed(2)
          };

          quotationData.push(quotation);
        }));

        setQuotations(quotationData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <div className="list">
        <div className="listContainer">
          <div className="datatable">
            <div className="datatableTitle">
              <h1>Quotation</h1>
              <Link to="/Createquotation" className="link">
                  Create Quotation
              </Link>
              </div>
              <DataGrid
              className="quotation-table"
              rows={quotations}
              columns={[
                { field: 'quotationNo', headerName: 'QuotationNo', width: 230, renderCell: (params) => (
                  <Link to={`/QuotationDetails/${params.row.id}`}>{params.value}</Link>
                )
                },
                { field: 'cusName', headerName: 'Customer Name', width: 230 },
                { field: 'issuedDate', headerName: 'Issued Date', width: 230 },
                { field: 'expiredDate', headerName: 'Expired Date', width: 230 },
                { field: 'grandTotal', headerName: 'Amount', width: 230 },
              ]}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quotation;

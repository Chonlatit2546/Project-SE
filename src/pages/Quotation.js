import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setStoredUsername(storedUsername);
    }
    console.log("Username in Home:", storedUsername);
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const quotationSnapshot = collection(db, 'productPO');
        const unsubscribe = onSnapshot(quotationSnapshot, async (snapshot) => {
          const quotationData = await Promise.all(snapshot.docs.map(async (doc) => {
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

            return {
              id: doc.id,
              quotationNo: quotationNoId,
              cusName: quotationNoData.cusName,
              issuedDate: quotationNoData.issuedDate,
              expiredDate: quotationNoData.expiredDate, 
              grandTotal: grandTotal.toFixed(2),
              status: quotationNoData.status
            };
          }));
          setQuotations(quotationData);
          setLoading(false);
        });
        return unsubscribe;
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

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
              <div className='Searchquo'>
              <input
                type="text"
                placeholder="Search "
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
              <div style={{ height: 550, width: '90%' }}>
              <DataGrid
              className="quotation-table"
              rows={quotations.filter((row) =>
                row.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.cusName.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              columns={[
                { field: 'quotationNo', headerName: 'QuotationNo', width: 230, renderCell: (params) => (
                  <Link to={`/QuotationDetails/${params.row.id}`}>{params.value}</Link>
                )
                },
                { field: 'cusName', headerName: 'Customer Name', width: 230 },
                { field: 'issuedDate', headerName: 'Issued Date', width: 230 },
                { field: 'expiredDate', headerName: 'Expired Date', width: 230 },
                { field: 'grandTotal', headerName: 'Amount', width: 230 },
                  { field: 'status', headerName: 'Status', width: 230, renderCell: (params) => {
                  const status = params.row.status;
          
                  if(status === "Pending Approval"){
                    return <span style={{ color: "purple" }}>{status}</span>;
          
                  }
                  else if(status === "Waiting for Response"){
                    return <span style={{ color: "orange" }}>{status}</span>;
                  }else if(status === "Closed"){
                    return <span style={{ color: "green" }}>{status}</span>;
          
                  }
                  else if(status === "On Hold"){
                    return <span style={{ color: "mint" }}>{status}</span>;
                  }
                  else{
                    return <span style={{ color: "blue" }}>{status}</span>;
                  }
                }  },
              ]}
              onSearchChange={handleSearch}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Quotation;

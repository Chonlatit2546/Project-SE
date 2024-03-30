import React, { useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { getDoc, doc, deleteDoc, getDocs, onSnapshot,collection, setDoc, updateDoc, documentId } from 'firebase/firestore';
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import Navbar from '../components/Navbar';

import './css/Purchaseorders.css'; 

function Purchaseorder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [ProductPOData, setProductPOData] = useState([]);
  const [menuActive, setMenuActive] = useState(true);
  
  
  

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const pocollection = collection(db,'po')

        ///real-time collection data
        const adddataPO = onSnapshot(pocollection,async (snapshot) => {
          
          const purchaseOrdersData = snapshot.docs.map(async (doc) => {
            
            const poData = doc.data();

            //reference productPO table
            const productPORef = poData.productPO;
            const productPODoc = await getDoc(productPORef);
            const productPOData = { id: productPORef.id, ...productPODoc.data() };
            setProductPOData(productPOData);

            //reference quotation table
            const quotationRef = productPOData.quotationNo;
            const quotationDoc = await getDoc(quotationRef);
            const quotationData = quotationDoc.data();

            let grandTotal = 0;
            Object.keys(productPOData).forEach(key => {
            if (key.startsWith('productNo')) {
              const product = productPOData[key];
              const subtotalProduct = product.quantity * product.unitPrice;
              grandTotal += subtotalProduct;
              console.log('qNoData:', product);
            }
           });

          const vat = 0.07;
          grandTotal *= 1 + vat;

            
          

            return{
              id:doc.id,
              ponumber:doc.id,
              customerId: quotationData?.cusName || 'Unknown',
              expiredDate: poData.expiredDate,
              issuedDate: poData.issuedDate,
              amount: grandTotal.toFixed(2),
              status: poData.status,
            };
          });
          Promise.all(purchaseOrdersData).then((data) => setPurchaseOrders(data))
          

        });

        return () => {
          adddataPO()
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPurchaseOrders();


  }, []);



  const actionColumn = {
    field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
          const status = params.row.status;
          const id = params.row.id;

          if(status === "Closed"){
            return(
              <div>
                <Link to={`/PurchaseOrderDetails/${params.row.id}`}>Details</Link>
              </div>
            );
          }
          else{
            return(
              <div>
                <Link to={`/CreateReceipt/${params.row.id}`}>CreateReceipt</Link>
              </div>
            );
          }
      }
  }
  

  const columns = [
    { field: "ponumber",
     headerName: "PO Number",
      width: 230,
      renderCell: (params) => {
        const status = params.row.status;
        const id = params.row.id;

        if(status === "Closed" || status === "On Hold"){
          return(
            <div>
              <Link to={`/PurchaseOrderDetails/${params.row.id}`}>{params.value}</Link>
            </div>
          );
        }
        else{
          return(
            <div>
              <Link to={`/CreateReceipt/${params.row.id}`}>{params.value}</Link>
            </div>
          );
        }
    }
    },

    { field: "customerId",
     headerName: "Customer", 
     width: 230 
    },

    { field: "issuedDate", 
    headerName: "Issued Date", 
    width: 230 
    },

    { field: "expiredDate",
     headerName: "Expired Date", 
     width: 230 },

    { field: "amount", 
    headerName: "Amount", 
    width: 230 
    },
    { field: "status"
    , headerName: "Status"
    , width: 320,
      renderCell: (params) => {
        const status = params.row.status;

        if(status === "Closed"){
          return <span style={{ color: "green" }}>{status}</span>;

        }
        else if(status === "On Hold"){
          return <span style={{ color: "mint" }}>{status}</span>;
        }
        else{
          return <span style={{ color: "blue" }}>{status}</span>;
        }
      } 

    },

  ];

  return (
    
      <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
        <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
        <div className="list">
          <div className="listContainer">
            <div className="datatable">
              <div className="datatableTitle">
                <h1>Purchase Orders</h1>
              </div>
              <div >
                {purchaseOrders.length > 0 ? (
                  <DataGrid className="po-table"
                  rows={purchaseOrders} 
                  columns={columns} 
                  pageSize={10} 
                  rowsPerPageOptions={[10]}
                  
                  
                  
                  />
                ) : (
                  <div class="loader"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}

export default Purchaseorder;

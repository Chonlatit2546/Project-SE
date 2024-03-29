import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import Navbar from '../components/Navbar';
import { Link } from "react-router-dom";

function Purchaseorder() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  
  

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
            const productPOData = productPODoc.data();

            //reference quotation table
            const quotationRef = productPOData.quotationNo;
            const quotationDoc = await getDoc(quotationRef);
            const quotationData = quotationDoc.data();

            return{
              id:doc.id,
              customerId: quotationData?.cusName || 'Unknown',
              expiredDate: poData.expiredDate,
              issuedDate: poData.issuedDate,
              amount: productPOData.amount,
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
                <Link to={`/PurchaseOrderDetails/${id}`}>Details</Link>
              </div>
            );
          }
          else{
            return(
              <div>
                <Link to={`/CreateReceipt/${id}`}>CreateReceipt</Link>
              </div>
            );
          }
      }
  }
  

  const columns = [
    { field: "id",
     headerName: "PO Number",
      width: 230 
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
        else{
          return <span style={{ color: "blue" }}>{status}</span>;
        }
      } 

    },

  ];

  return (
    
      <div>
        
        <div className="list">
          <div className="listContainer">
            <div className="datatable">
              <div className="datatableTitle">
                <h1>Purchase Orders</h1>
              </div>
              <div style={{ height: 400, width: "100%" }}>
                {purchaseOrders.length > 0 ? (
                  <DataGrid 
                  rows={purchaseOrders} 
                  columns={columns.concat(actionColumn)} 
                  pageSize={5} 
                  /*checkboxSelection
                  disableSelectionOnClick*/
                  //onCellClick={handleCellClick}
                  
                  
                  />
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}

export default Purchaseorder;

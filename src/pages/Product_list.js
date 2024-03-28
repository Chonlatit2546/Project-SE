import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/Product_list.css";

function Product_list() {
  const [product, setProduct] = useState([]);
  useEffect(() => {
    const addtolist = onSnapshot(
      collection(db, "product"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProduct(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      addtolist();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "product", id));
      setProduct(product.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to="#" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const ProductColumns = [
    { field: "id", headerName: "Product ID", width: 230 },
    {
      field: "productName",
      headerName: "Name",
      width: 230,
    },
    {
      field: "size",
      headerName: "Size",
      width: 230,
    },

    {
      field: "unit",
      headerName: "Unit",
      width: 230,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="list">
        <div className="listContainer">
          <div className="datatable">
            <div className="datatableTitle">
              <h1>Product list</h1>
              <Link to="/Addproduct" className="link">
                add product
              </Link>
            </div>
            <DataGrid
              className="datagrid"
              rows={product}
              columns={ProductColumns.concat(actionColumn)}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Product_list;

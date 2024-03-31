import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/Product_list.css";
import { useNavigate } from "react-router-dom";

function Product_list() {

  const navigate = useNavigate(); //navigate  ใช้สำหรับการเปลี่ยนหน้า

  const [search, setSearch] = useState("");

  const [product, setProduct] = useState([]);
  const [menuActive, setMenuActive] = useState(true);


  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

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
            <Link to={`/ViewProduct/${params.row.id}`} style={{ textDecoration: "none" }}>
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
    { field: "id", 
    headerName: "Product ID",
    width: 300,
    renderCell:(params) => {
      return(
        <div>
          <Link className="Product-list-link" to= {`/ViewProduct/${params.row.id}`}>{params.value}</Link>
        </div>
      );
    }
   },
    {
      field: "productName",
      headerName: "Name",
      width: 400,
    },
    {
      field: "size",
      headerName: "Size",
      width: 300,
    },

    {
      field: "unit",
      headerName: "Unit",
      width: 300,
    },
  ];

  return (
    <div className={`container ${menuActive ? 'menu-inactive' : 'menu-active'}`}>
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <div className="product-list">
        <div className="product-listContainer">
          <div className="product-datatable">
            <div className="product-datatableTitle">
              <h1>Product list</h1>
              <Link to="/Addproduct" className="add-product-link">
                add product
              </Link>
            </div>
            <div className='product-Search'>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <DataGrid
              className="product-datagrid"
              rows={product.filter((row) =>
                row.id.toLowerCase().includes(search.toLowerCase()) ||
                row.productName.toLowerCase().includes(search.toLowerCase())
              )}
              //columns={ProductColumns.concat(actionColumn)}
              columns={ProductColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product_list;

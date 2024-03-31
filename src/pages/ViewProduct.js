import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs,deleteDoc,query,where,writeBatch} from "firebase/firestore";
import { db } from "../firebase";
import { DataGrid } from "@mui/x-data-grid";
import "./css/ViewProduct.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";


function ViewProduct() {

  const navigate = useNavigate(); //ใช้สำหรับเปลี่ยนหน้า

  const { id } = useParams(); // สำหรับรับ id ที่ส่งมา

  const [menuActive, setMenuActive] = useState(true); // State สำหรับ Navbar

  const [product, setProduct] = useState(null);// State สำหรับ product

  const [productOwns, setProductOwns] = useState(null); //State สำหรับ ProductOwn

  useEffect(() => {
    //------------------------------------------------ดึงข้อมูล Product--------------------------------------------------------------------
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "product", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    //--------------------------------------------------- ดึงข้อมูลของ ProductOwn----------------------------------------------------------
    const fetchProductOwns = async () => {
      try {
        console.log(id);
        const productOwnsCollectionRef = collection(db, "productOwn");
        const productOwnsSnapshot = await getDocs(productOwnsCollectionRef);

        let list = [];
        productOwnsSnapshot.docs.forEach(async (doc) => {
          // Get the data of the document
          const data = doc.data();
          // Get the venID reference from the document data
          const venIDRef = data.venID;
          // Get the document data of the venID reference
          const venderID = venIDRef.id;
          const venIDDoc = await getDoc(venIDRef);
          // Get the data from the venID document
          const venIDData = venIDDoc.data();

          const productIdRef = data.prodID;

          if (productIdRef.id === id) {
            list.push({
              id: venderID,
              ...data,
              name: venIDData.name,
              phone: venIDData.phone,
            });
          }
        
          setProductOwns(list);
        });
      } catch (error) {
        console.error("Error fetching productOwns:", error);
      }
    };

    fetchProduct();
    fetchProductOwns();
  }, [id]);
  console.log("Product Data:", product);
  console.log("productOwn", productOwns);
  if (!product) {
    return <div>Loading...</div>;
  }

  //-------------------------------------------------- Action สำหรับ ปุ่มกดกลับไปหน้า Product list-----------------------------------------
  const GoBack = () => {
    navigate('/Product_list');
};
  //--------------------------------------------------- Action สำหรับ ปุ่ม Delete Product -----------------------------------------------
const deleteProduct = async () => {
  try {
    // ตรวจสอบก่อนว่าผู้ใช้ต้องการลบจริงหรือไม่
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    
    if (confirmed) {
      // ลบข้อมูลผลิตภัณฑ์จากฐานข้อมูล
      const productDocRef = doc(db, "product", id);
      await deleteDoc(productDocRef);

      // ลบข้อมูลผลิตภัณฑ์ที่เกี่ยวข้องออกจากฐานข้อมูล
      const productOwnsCollectionRef = collection(db, "productOwn");
      const querySnapshot = await getDocs(query(productOwnsCollectionRef, where("prodID", "==", productDocRef)));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // หลังจากลบข้อมูลเสร็จสิ้น ให้ทำการ redirect ไปยังหน้า Product_list หรือหน้าอื่นตามที่คุณต้องการ
      navigate('/Product_list');
      
      console.log("Product deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
};

  //--------------------------------------------------------H T M L--------------------------------------------------------------------
  return (
    <div
      className={`container ${menuActive ? "menu-inactive" : "menu-active"}`}
    >
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />
      <div className="product-page-manage">
        <div className="Head-ViewProduct-Page">
        <IoChevronBack className = "backButton" onClick={GoBack}/>
        <h1 className="Head-Name"> Product List - {id} </h1>
        </div>
        <div className="Top-head">
          <div className="ID-Head">ProductID {id}</div>
          <div className="product-options-dropdown">
            <button className="product-option-button">option</button>
            <div className="product-options-dropdown-content">
              <Link to={`/EditProduct/${id}`} className="product-edit-btn">
                Edit Product
              </Link>
              <button className="product-delete-btn" onClick={deleteProduct}>Delete Product</button>
            </div>
          </div>
        </div>
        <div className="view-product">
          <div className="View-product-info">
            <div className="view-product-info">
              Product
              <div className="view-Product-ID">
                <label htmlFor="view-productID">ProductID</label>
                <label className="view-productID-r">{id}</label>
              </div>
              <div className="view-Product-Name">
                <label htmlFor="view-productName">Name</label>
                <label className="view-productName-r">
                  {product.productName}
                </label>
              </div>
            </div>
            <div className="view-Description-info">
              Description
              <div className="view-Material">
                <label htmlFor="material">Material</label>
                <label>{product.material}</label>
              </div>
              <div className="view-Color">
                <label htmlFor="color">Color</label>
                <label>{product.color}</label>
              </div>
              <div className="view-Size">
                <label htmlFor="size">Size</label>
                <label>{product.size}</label>
              </div>
              <div className="view-Unit">
                <label htmlFor="unit">Unit</label>
                <label>{product.unit}</label>
              </div>
            </div>
          </div>
          <div className="view-Product-Own">
            <div className="view-Product-Own-Info">Product Own</div>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={productOwns || {}}
                columns={[
                  { field: "id", headerName: "Vendor ID", width: 200 },
                  { field: "name", headerName: "Name", width: 400 },
                  { field: "phone", headerName: "Phone Number", width: 300 },
                  { field: "unitPrice", headerName: "Unit price", width: 100 },
                  { field: "savedDate", headerName: "Saved Date", width: 200 },
                ]}
                pageSize={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProduct;

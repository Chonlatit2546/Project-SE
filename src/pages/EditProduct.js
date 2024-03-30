import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { doc, getDoc, updateDoc, getDocs, collection, writeBatch} from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import "./css/EditProduct.css";
import { IoIosAddCircle } from "react-icons/io";

function EditProduct() {
  const [menuActive, setMenuActive] = useState(true);
  const { id } = useParams();

  const [product, setProduct] = useState({
    productName: "",
    material: "",
    color: "",
    size: "",
    unit: "",
  });

  // const [productOwn, setProductOwn] = useState({
  //   venID: "",
  //   savedDate: "",
  //   unitPrice: "",
  //   prodID: "",
  // });

  const [productOwn, setProductOwn] = useState([]);
  const [productOwnID,setProductOwnID] = useState([]);
  const [AddProductOwn, setAddProductOwn] = useState([]);

  useEffect(() => {
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

    const fetchProductOwn = async () => {
      try {
        const productOwnsCollectionRef = collection(db, "productOwn");
        const productOwnsSnapshot = await getDocs(productOwnsCollectionRef);
        const newProductOwn = [];
        productOwnsSnapshot.docs.forEach(async (doc) => {
          const data = doc.data();
          const productIdRef = data.prodID;
          const venIDRef = data.venID;
          
          // ตรวจสอบว่า productIdRef.id เท่ากับ id ที่ได้รับจาก useParams() หรือไม่
          if (productIdRef.id === id) {
            // ถ้าตรงกัน ก็เพิ่มข้อมูล productOwn ลงใน state

            // setProductOwn({
            //   venID: venIDRef.id,
            //   savedDate: data.savedDate,
            //   unitPrice: data.unitPrice,
            //   prodID: productIdRef.id,
            // });
            newProductOwn.push({
              id:doc.id,
              venID: venIDRef,
              savedDate: data.savedDate,
              unitPrice: data.unitPrice,
              
            });
          }
          // console.log('productOwnIdRef',productOwnIdRef);
          // console.log('productIdRef',productIdRef.id);
        });

        setProductOwn(newProductOwn);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchProductOwn();
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleProductOwnChange = (e, index) => {
    const updatedProductOwns = [...productOwn];
    const { name, value } = e.target;

    updatedProductOwns[index] = {
      ...updatedProductOwns[index],
      [name]: value,
    };

    console.log("updatedProductOwns", updatedProductOwns);
    setProductOwn(updatedProductOwns);
  };

  const addProductOwn = () => {
    setAddProductOwn([...AddProductOwn, {}]);
  };

  const deleteProductOwn = (index) => {
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns.splice(index, 1);
    setAddProductOwn(updatedProductOwns);
  };

  const save = async () => {
    try {
      // อัพเดทข้อมูลของ product
      const productDocRef = doc(db, "product", id);
      await updateDoc(productDocRef, product);

      // อัพเดทข้อมูลของ productOwn
      const productOwnsCollectionRef = collection(db, "productOwn");
      const batch = writeBatch(db);

      productOwn.forEach((item, index) => {


        console.log("item.id",item.id);
        const productOwnID = item.id;

        const productOwnRef = doc(db, "productOwn",productOwnID);
        const vendorRef = item.venID;
        // console.log("productOwnRef",productOwnRef)
        // console.log("vendorRefID",vendorRef.id);
        // const productOwn_venID_Ref = doc(db, "vendor", vendorRef);



        // console.log(productOwn_venID_Ref);
        console.log("vendorRef",vendorRef)

        
        productOwn[index]["venID"] = vendorRef;
        

        const productOwnDocRef = doc(productOwnsCollectionRef, productOwnID);

        batch.update(productOwnDocRef, productOwn[index]);
      });

      await batch.commit();

      

      alert("Data updated successfully");
      console.log("Data updated successfully");
    } catch (error) {

      alert("Error updating data: ", error);
      console.error("Error updating data: ", error);
    }
  };

  console.log("product", product);
  console.log("productOwn", productOwn);

  return (
    <div
      className={`container ${menuActive ? "menu-inactive" : "menu-active"}`}
    >
      <Navbar setMenuActive={setMenuActive} menuActive={menuActive} />

      <div className="EditProduct-form">
        <h1 className="Edit-Head-Topic">Edit product-{id}</h1>
        <form>
          <div className="Edit-Product-part">
            <div className="Edit-Product-info">
              Product
              <div className="Edit-Product-ID">
                <label htmlFor="productID">ProductID</label>
                <input type="text" id="productID" value={id} />
              </div>
              <div className="Edit-Product-Name">
                <label htmlFor="productName">Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  onChange={handleChange}
                  value={product.productName || ""}
                />
              </div>
            </div>
            <div className="Edit-Description">
              Description
              <div className="Edit-Material">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  onChange={handleChange}
                  value={product.material || ""}
                />
              </div>
              <div className="Edit-Color">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  onChange={handleChange}
                  value={product.color || ""}
                />
              </div>
              <div className="Edit-Size">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  onChange={handleChange}
                  value={product.size || ""}
                />
              </div>
              <div className="Edit-Unit">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  onChange={handleChange}
                  value={product.unit || ""}
                />
              </div>
            </div>
          </div>
          <div className="Edit-Product-Own">
            <div className="Edit-Product-Own-Info">
              Product Own
              <div className="Edit-ProductOwn-item-manage">
                {productOwn.map(
                  (item, index) =>
                    item && (
                      <div key={index} className="Edit-ProductOwn-item">
                        <div className="Edit-VendorID">
                          <label htmlFor={`vendorID${index}`}>VendorID</label>
                          <input
                            type="text"
                            id={`vendorID${index}`}
                            value={item.venID.id}
                            name="venID"
                            readOnly
                          />
                        </div>
                        <div className="Edit-SavedDate">
                          <label htmlFor={`saveDate${index}`}>Saved Date</label>
                          <input
                            type="date"
                            id={`saveDate${index}`}
                            value={item.savedDate}
                            name="savedDate"
                            onChange={(e) => handleProductOwnChange(e, index)}
                          />
                        </div>
                        <div className="Edit-UnitPrice">
                          <label htmlFor={`unitPrice${index}`}>
                            Unit Price
                          </label>
                          <input
                            type="text"
                            id={`unitPrice${index}`}
                            value={item.unitPrice}
                            name="unitPrice"
                            onChange={(e) => handleProductOwnChange(e, index)}
                          />
                        </div>
                        <div className="ProductOwn-Delete">
                          <button
                            type="button"
                            className="ProductOwn-Delete-Button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                )}
              </div>
              <div className="AddmoreProductOwn">
                <IoIosAddCircle onClick={addProductOwn} />
                <label className="add">Add more Product Own</label>

                <div className="more-vendor">
                  {AddProductOwn.map((productOwn, index) => (
                    <div key={index} className="addVendor">
                      <div className="addVendorID">
                        <label htmlFor="vendorID">VendorID</label>
                        <input
                          type="text"
                          id="vendorID"
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.vendorID}
                        />
                      </div>
                      <div className="AddSaveDate">
                        <label htmlFor="saveDate">Saved Date</label>
                        <input
                          type="date"
                          id="saveDate"
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.saveDate}
                        />
                      </div>
                      <div className="AddUnitPrice">
                        <label htmlFor="unitPrice">Unit Price</label>
                        <input
                          type="text"
                          id="unitPrice"
                          // onChange={(e) => handleAddProductOwnChange(e, index)}
                          // value={productOwn.unitPrice}
                        />
                      </div>
                      <button
                        className="Delete-addvendor"
                        type="button"
                        onClick={() => deleteProductOwn(index)}
                      >
                        Delete
                      </button>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="add-product-Footer">
        <div className="footer-manage">
          <div>
            <label>ProductID: {id}</label>
          </div>

          <div className="Submit-Button">
            <div className="Cancle">
              <button className="Cancel-Button">Cancel</button>
            </div>
            <div className="Edit-Save-Product-Button">
              <button type="Save-product" onClick={save}>save</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default EditProduct;

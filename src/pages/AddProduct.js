import React from "react";
import Navbar from "../components/Navbar";
import "./css/AddProduct.css";
import { IoIosAddCircle } from "react-icons/io";
import { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productID: "",
    productName: "",
    material: "",
    color: "",
    size: "",
    unit: "",
    vendorID: "",
    saveDate: "",
    unitPrice: "",
  });

  const [newProductID, setNewProductID] = useState("");
  const [newProductOwnID, setNewProductOwnID] = useState("");

  const [AddProductOwn, setAddProductOwn] = useState([]);

  useEffect(() => {
    const checkAmountofProductDoc = async () => {
      try {
        const productDoc = await getDocs(collection(db, "product"));
        const prod_docCount = productDoc.size;
        const newProductID = `pd${String(prod_docCount + 1).padStart(4, "0")}`;
        setNewProductID(newProductID);
      } catch (e) {
        console.log("Error", e);
      }
    };

    const checkAmountofProductOwnDoc = async () => {
      try {
        const productOwnDoc = await getDocs(collection(db, "productOwn"));
        const prodOwn_docCount = productOwnDoc.size;
        const newProductOwnID = `pdv${String(prodOwn_docCount + 1).padStart(
          4,
          "0"
        )}`;
        setNewProductOwnID(newProductOwnID);
        console.log("amount of productOwn", newProductOwnID);
      } catch (e) {
        console.log("Error", e);
      }
    };

    checkAmountofProductDoc();
    checkAmountofProductOwnDoc();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      if ((product.saveDate || product.unitPrice) && !product.vendorID) {
        throw new Error("Please fill in vendorID");
      }

      const hasEmptyVendorID = AddProductOwn.some(
        (productOwn) => (!productOwn.vendorID) && (productOwn.saveDate || productOwn.unitPrice)
      );

      if (hasEmptyVendorID) {
        throw new Error("Please fill in vendorID for each Product Own");
      }

      if (product.vendorID && AddProductOwn) {
        const productOwnCollectionRef = collection(db, "productOwn");
        
        // เพิ่มข้อมูลของ Product Own ที่ถูกเพิ่มเข้ามาผ่านอินพุตฟิลด์
        await Promise.all(
          AddProductOwn.map(async (productOwn, index) => {
            const nextNewProductOwnID = `pdv${String(
              Number(newProductOwnID.slice(3)) + index + 1
            ).padStart(4, "0")}`;
            console.log("addmore", nextNewProductOwnID);
            console.log(productOwn);
            console.log(productOwn.vendorID);
            console.log(productOwn.saveDate);
            console.log(productOwn.unitPrice);
            
            const productDocRef = doc(db, "product", newProductID);
            const vendorDocRef = doc(db, "vendor", productOwn.vendorID);

            await setDoc(doc(productOwnCollectionRef, nextNewProductOwnID), {
              prodID: productDocRef,
              venID: vendorDocRef,
              savedDate: productOwn.saveDate || "",
              unitPrice: productOwn.unitPrice || "",
            });
          })
        );
      }

      const productCollectionRef = collection(db, "product");

      await setDoc(doc(productCollectionRef, newProductID), {
        productName: product.productName,
        material: product.material,
        color: product.color,
        size: product.size,
        unit: product.unit,
      });

      if (product.vendorID) {
        const productOwnCollectionRef = collection(db, "productOwn");
        const productDocRef = doc(db, "product", newProductID);
        const vendorDocRef = doc(db, "vendor", product.vendorID);

        await setDoc(doc(productOwnCollectionRef, newProductOwnID), {
          prodID: productDocRef,
          venID: vendorDocRef,
          savedDate: product.saveDate,
          unitPrice: product.unitPrice,
        });
      }

      const checkAmountofProductDoc = async () => {
        try {
          const productDoc = await getDocs(collection(db, "product"));
          const prod_docCount = productDoc.size;
          const newProductID = `pd${String(prod_docCount + 1).padStart(
            4,
            "0"
          )}`;
          setNewProductID(newProductID);
        } catch (e) {
          console.log("Error", e);
        }
      };

      checkAmountofProductDoc();

      const checkAmountofProductOwnDoc = async () => {
        try {
          const productOwnDoc = await getDocs(collection(db, "productOwn"));
          const prodOwn_docCount = productOwnDoc.size;
          const newProductOwnID = `pdv${String(prodOwn_docCount + 1).padStart(
            4,
            "0"
          )}`;
          setNewProductOwnID(newProductOwnID);
          console.log("amount of productOwn", newProductOwnID);
        } catch (e) {
          console.log("Error", e);
        }
      };

      checkAmountofProductOwnDoc();

      setProduct({
        productID: "",
        productName: "",
        material: "",
        color: "",
        size: "",
        unit: "",
        vendorID: "",
        saveDate: "",
        unitPrice: "",
      });

      setAddProductOwn([]);

      navigate("/AddProduct");
      alert("add successful");
    } catch (e) {
      alert("add fail");
      console.log("error", e);
    }
  };

  const Cancel = () => {
    setProduct({
      productID: "",
      productName: "",
      material: "",
      color: "",
      size: "",
      unit: "",
      vendorID: "",
      saveDate: "",
      unitPrice: "",
    });

    setAddProductOwn([]);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const addProductOwn = () => {

  
    setAddProductOwn([...AddProductOwn, {}]);
  };

  const handleAddProductOwnChange = (e, index) => {
    const { id, value } = e.target;
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns[index][id] = value;

    setAddProductOwn(updatedProductOwns);
  };

  const deleteProductOwn = (index) => {
    const updatedProductOwns = [...AddProductOwn];
    updatedProductOwns.splice(index, 1);
    setAddProductOwn(updatedProductOwns);
  };

  return (
    <div>
      <Navbar />
      <h1 className="Head-Topic"> Add product</h1>

      <div className="addProduct-form">
        <form>
          <div className="Product">
            <div className="Product-info">
              Product
              <div className="Product-ID">
                <label htmlFor="productID">ProductID</label>
                <input
                  type="text"
                  id="productID"
                  onChange={handleChange}
                  value={newProductID}
                />
              </div>
              <div className="Product-Name">
                <label htmlFor="productName">Name</label>
                <input
                  type="text"
                  id="productName"
                  onChange={handleChange}
                  value={product.productName}
                />
              </div>
            </div>
            <div className="Description">
              Description
              <div className="Material">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  onChange={handleChange}
                  value={product.material}
                />
              </div>
              <div className="Color">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  onChange={handleChange}
                  value={product.color}
                />
              </div>
              <div className="Size">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  onChange={handleChange}
                  value={product.size}
                />
              </div>
              <div className="Unit">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  onChange={handleChange}
                  value={product.unit}
                />
              </div>
            </div>
          </div>
          <div className="Product-Own">
            <div className="Product-Own-Info">
              Product Own
              <div className="VendorID">
                <label htmlFor="vendorID">VendorID</label>
                <input
                  type="text"
                  id="vendorID"
                  onChange={handleChange}
                  value={product.vendorID}
                ></input>
              </div>
              <div className="SavedDate">
                <label htmlFor="saveDate">Saved Date</label>
                <input
                  type="date"
                  id="saveDate"
                  onChange={handleChange}
                  value={product.saveDate}
                ></input>
              </div>
              <div className="UnitPrice">
                <label htmlFor="unitPrice">Unit Price</label>
                <input
                  type="text"
                  id="unitPrice"
                  onChange={handleChange}
                  value={product.unitPrice}
                ></input>
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
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.vendorID}
                        ></input>
                      </div>
                      <div className="AddSaveDate">
                        <label htmlFor="saveDate">Saved Date</label>
                        <input
                          type="date"
                          id="saveDate"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.saveDate}
                        ></input>
                      </div>
                      <div className="AddUnitPrice">
                        <label htmlFor="unitPrice">Unit Price</label>
                        <input
                          type="text"
                          id="unitPrice"
                          onChange={(e) => handleAddProductOwnChange(e, index)}
                          value={productOwn.unitPrice}
                        ></input>
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

      <footer className="Footer">
        <div className="footer-manage">
          <div>
            <label>ProductID: {newProductID}</label>
          </div>

          <div className="Submit-Button">
            <div className="Cancle">
              <button className="Cancel-Button" onClick={Cancel}>
                Cancle
              </button>
            </div>
            <div className="Add-Product-Button" onClick={addProduct}>
              <button type="Submit">Add Product</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AddProduct;
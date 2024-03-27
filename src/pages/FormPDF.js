import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const FormPDF = ({ quotationData, productData, productPOData, total, vat, grandTotal }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Quotation No: {quotationData.id}</Text>
        <Text>Refer To: Issued Date: {quotationData.issuedDate} Expired Date: {quotationData.expiredDate}</Text>
        <Text>Customer Name: {quotationData.cusName} Customer Address: {quotationData.cusAddress || "-"}</Text>
        <Text>Customer Email: {quotationData.cusEmail || "-"} Customer Department: {quotationData.cusDepartment || "-"}</Text>
        <Text>Customer Phone Number: {quotationData.cusPhoneNo}</Text>
        <Text>Item | Description | Quantity | Unit | Unit Price | Amount</Text>
        {productData.map((product, index) => (
          <Text key={index}>
            {index + 1} {product.id} {product.productName} Color: {product.color} Material: {product.material} {productPOData[`productNo${index + 1}`].quantity} {product.unit} {productPOData[`productNo${index + 1}`].unitPrice} {productPOData[`productNo${index + 1}`].quantity * productPOData[`productNo${index + 1}`].unitPrice}
          </Text>
        ))}
        <Text>Summary</Text>
        <Text>Total: {total} </Text><Text>VAT (7%): {vat}</Text>
        <Text>Grand Total: {grandTotal}</Text>
      </View>
    </Page>
  </Document>
);


export default FormPDF;

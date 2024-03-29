import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: '#000',
      paddingVertical: 5,
    },
    tableCell: {
        flex: 1,
        textAlign: 'left',
        marginLeft: 8,
        fontSize: 10,
        color: '#333',
      },
    qtyCell: {
      flex: 1,
      textAlign: 'center',
      marginLeft: 8,
      fontSize: 10,
      color: '#333',
    },
    itemCell: {
        flex: 1,
      textAlign: 'left',
      marginLeft: 8,
      fontSize: 10,
      color: '#333',
    },
    descriptionCell: {
        flex: 5, 
        textAlign: 'left',
        fontSize: 10,
        color: '#333',
      },
    headerText: {
      fontWeight: 'bold',
      fontSize: 12,
      marginBottom: 5,
    },
  });

  const FormPDF = ({ quotationData, productData, productPOData, total, vat, grandTotal }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.headerText}>Quotation No: {quotationData.id}      Issued Date: {quotationData.issuedDate}      Expired Date: {quotationData.expiredDate}</Text>
          <Text style={styles.headerText}>Customer Name: {quotationData.cusName}</Text>
          <Text style={styles.headerText}>Customer Address: {quotationData.cusAddress || "-"}</Text>
          <Text style={styles.headerText}>Customer Email: {quotationData.cusEmail || "-"}</Text>
          <Text style={styles.headerText}>Customer Department: {quotationData.cusDepartment || "-"}           Customer Phone Number: {quotationData.cusPhoneNo}</Text>
          <Text style={[styles.headerText, { marginTop: 10 }]}>        Item  |                                 Description                                |   Qty   |   Unit   |  UnitPrice  |    Amount       </Text>
          {productData.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.itemCell}>{index + 1}</Text>
              <Text style={styles.descriptionCell}>{product.productName} ({product.color}) Material: {product.material}</Text>
              <Text style={styles.qtyCell}>{productPOData[`productNo${index + 1}`].quantity}</Text>
              <Text style={styles.tableCell}>{product.unit}</Text>
              <Text style={styles.tableCell}>{productPOData[`productNo${index + 1}`].unitPrice}</Text>
              <Text style={styles.tableCell}>{(productPOData[`productNo${index + 1}`].quantity * productPOData[`productNo${index + 1}`].unitPrice).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={[styles.headerText, { marginTop: 10 }]}>-----Summary-----</Text>< br/>
          <Text style={styles.headerText}>Total: {total} </Text><Text style={styles.headerText}>VAT (7%): {vat}</Text>
          <Text style={styles.headerText}>Grand Total: {grandTotal}</Text>
        </View>
      </Page>
    </Document>
  );
  
  export default FormPDF;

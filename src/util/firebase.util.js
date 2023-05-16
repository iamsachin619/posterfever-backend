const {
  initializeApp,
  applicationDefault,
  cert
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue
} = require("firebase-admin/firestore");

// const config = {
//   apiKey: "AIzaSyB8pBP1U-RgWxHR7ETqDDjfxpwF-qjYzz8",
//   authDomain: "thepostercompany-c368f.firebaseapp.com",
//   projectId: "thepostercompany-c368f",
//   storageBucket: "thepostercompany-c368f.appspot.com",
//   messagingSenderId: "668639918276",
//   appId: "1:668639918276:web:aef01f8439ade2ff10f191",
//   measurementId: "G-V1B0ZXFN1N"
// };

initializeApp({
  credential: cert(111302178909899141859)
});

const db = getFirestore();
const CreateOrderMain = async (order) => {
  const orderRef = db.doc(`orders/${order.id}`);
  orderRef.set({
    order
  });
};

module.exports = { CreateOrderMain };

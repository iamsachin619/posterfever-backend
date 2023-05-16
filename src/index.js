const util = require("./util/util");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
//const firebaseUtil = require("./util/firebase.util");

//firebase
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

const serviceAccount = require("./util/secure.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const CreateOrderMain = async (order) => {
  const orderRef = db.doc(`orders/${order.id}`);
  orderRef.set(order);
  const userRef = db.doc(`users/${order.user.uid}`);

  userRef.update({
    orders: FieldValue.arrayUnion(order)
  });
};

//backend appp
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

var instance = new Razorpay({
  //
  key_id: process.env.RAZORPAY_KEY_ID,
  //"rzp_live_WU4wZokD65JgjJ", //"rzp_test_yWBEp3MVsZcecj",
  //
  //process.env.RAZORPAY_SECRET
  key_secret: process.env.RAZORPAY_SECRET
  //"muT2XdWQ885LCGFKgCbwEghu"
  //"4Ki0NScZyg8IYrrnEGygM405"
  //
});

var server = app.listen(8080, () => {});

var cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.send("test");
});

app.post("/order", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  // amount to recive
  const amountToRecive = util.total(req.body.cart);

  try {
    var options = {
      amount: JSON.stringify(amountToRecive * 100), // amount in the smallest currency unit
      currency: "INR"
    };
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/success", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    // getting the details back from our font-end
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      cart,
      address,
      user,
      response,
      amount
    } = req.body;

    // Creating our own digest
    // The format should be like this:
    //digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", "4Ki0NScZyg8IYrrnEGygM405");

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    } else {
      //saving order
      CreateOrderMain({
        id: orderCreationId,
        timeCreated: new Date(),
        user: {
          uid: user.uid,
          Name: user.displayName,
          email: user.email
        },
        address: address,
        cart,
        amount,
        status: { processed: false }
      });
    }
    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      order: {
        id: orderCreationId,
        user: { uid: user.uid, Name: user.displayName, email: user.email },
        address: address,
        cart
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

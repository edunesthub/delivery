/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.sendNewOrderPush = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      const order = snap.data();
      // Replace this with your actual delivery user's email field
      const deliveryUserEmail = order.assignedToEmail || order.deliveryEmail || "test@example.com";

      if (!deliveryUserEmail) return null;

      const restaurant = order.restaurantName || "Unknown Restaurant";
      const message = `New delivery from ${restaurant}`;

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic os_v2_app_omcpehlwtjcjto7t7lvrkphkfarkwx76a7belynntbe6w42hmfr24dqi46d6yu3rrrkbgexs6qoabvlamkqaxupo4aijsdofwg3aq5y",
        },
        body: JSON.stringify({
          app_id: "7304f21d-769a-4499-bbf3-faeb153cea28",
          headings: {"en": "New Delivery Assigned!"},
          contents: {"en": message},
          include_external_user_ids: [deliveryUserEmail],
        }),
      });

      const data = await response.json();
      console.log("OneSignal push sent:", data);
      return null;
    });

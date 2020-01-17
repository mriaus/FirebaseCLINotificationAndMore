const functions = require('firebase-functions');
const faker = require('faker');
const admin = require('firebase-admin');
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript




//Intento personal (Salta al modificar la bbdd pero sigue sin mandar notificaciones)

exports.onChangeDB = functions.database.ref('/messages').onWrite(async (snapshot: any)=> {
 
    // Notification details.
  
    const message = {
      notification : {
        body : 'This is a Firebase Cloud Messaging Topic Message!',
        title : 'FCM Message'
  }
    };
          // Send notifications to all tokens.
       await admin.messaging().sendToTopic('haha',message);
      console.log('Notificacion mandada');
  

 // console.log('eje');
});



exports.addMessage = functions.https.onRequest(async (req: any, res: any) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({original: original});
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
  });
//Intento de seguimiento de tema
 exports.followTheme = functions.https.onCall((data:any) =>{

  admin.messaging().subscribeToTopic(data.token, data.topic)
  .then(function(response:any) {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully subscribed to topic:', response);
    console.log('Error?');
    console.log(response.errors[0].error.toString());
  })
  .catch(function(error:any) {
    console.log('Error subscribing to topic:', error);
  });
});
 
  // tslint:disable-next-line: no-shadowed-variable
  exports.unfollowTheme = functions.https.onCall((data:any)=>{
    admin.messaging().unsubscribeFromTopic(data.token, data.topic)
    .then(function(response:any) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log('Successfully unsubscribed to topic:', response);
      
    })
    .catch(function(error:any) {
      console.log('Error subscribing to topic:', error);
  })

 });

 


  exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot: { val: () => any; ref: { parent: any; }; }, context: { params: { pushId: any; }; }) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.

   
    // tslint:disable-next-line: no-unnecessary-type-assertion
    const  snap = snapshot.ref.parent!.child('uppercase').set(uppercase);
      return snap
    });

    const products: { name: any; price: any; }[] = []
    const LIMIT = 100

    for(let i = 0; i < LIMIT; i++){
      products.push({
        name: faker.commerce.productName(),
        price: faker.commerce.price()
      })
    }

   exports.products = functions.https.onRequest((request: { query: { page?: 1 | undefined; limit?: 10 | undefined; }; },response: { json: (arg0: { name: any; price: any; }[]) => any; }) =>{
    const { page = 1, limit = 10 } = request.query;
    
    const startAt = (page - 1) * limit;
    const endAt = startAt + limit;

      return response.json(products.slice(startAt, endAt));
   })

   exports.products2 = functions.https.onCall((input:any, context:any) => {
    const { page = 1, limit = 10 } = input;
   
    const startAt = (page - 1) * limit;
    const endAt = startAt + limit;
   
    return products.slice(startAt, endAt);
  });


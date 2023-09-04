const cors = require('cors');

require('dotenv').config();

const express = require('express');

const paypal = require('paypal-rest-sdk');

const app = express();

app.use(express.urlencoded());

app.use(express.json());

app.use(cors());


// paypal configuration

paypal.configure({
    mode: 'sandbox',  //live for production
    // client_id and client_secret
    client_id: 'ARSUKmXUZbymimXraIC8dvv54djNCsjiAQg2c8uqRHAJ6F_S0__yDdd_KA0n10ThKExYIo4cP1MbxRIl',
    client_secret: 'EBolg3AJ76u44b9qdPqJu0mOT2GDnrq20yqhZsT6UAb2xxpwmdqPTg8z0qfsS8fHjhnST_-T8a2Y20Tc'
});




app.post('/create-payment', (req, res) => {



    try {
        // create payment object 
        var payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://127.0.0.1:8585/success",
                "cancel_url": "http://127.0.0.1:8585/err"
            },
            "transactions": [{

                //***** items data ** */ 


                // item_list: {
                //     items: [
                //         {
                //             name: 'Product 1',
                //             sku: 'PROD001',
                //             price: '1000.00',
                //             currency: 'USD',
                //             quantity: 2,
                //         },
                //         {
                //             name: 'Product 2',
                //             sku: 'PROD002',
                //             price: '2000.00',
                //             currency: 'USD',
                //             quantity: 1,
                //         },z
                //     ],
                // },
                "amount": {
                    "total": 3000.00,
                    "currency": "USD"
                },
                "description": "payment transaction by Paypal"
            }]
        }


        // create payment
        // call the create Pay method 

        createPay(payment)
            .then((transaction) => {

                console.log(transaction, '*************\n\n\n\n\n\n\n');

                var id = transaction.id;
                var links = transaction.links;
                var counter = links.length;
                while (counter--) {
                    if (links[counter].method == 'REDIRECT') {
                        // redirect to paypal where user approves the transaction 
                        return  res.status(200).json({paypal_url :links[counter].href });
                             
                       
                    }
                }
            })
            .catch((err) => {
                console.log(err, '/*********');
                res.redirect('/err');
            });



    }
    catch (error) {
        console.log(error.message);
        return res.status(404).json({ message: error.message });
    }

})


// success page 
app.get('/success', (req, res) => {
    console.log('success',req.query);
    
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
      
        const executePaymentData = {
          payer_id: payerId,
        };
      
        paypal.payment.execute(paymentId, executePaymentData, (error, payment) => {
          if (error) {
           
            throw error;
          } else {
            
            // Payment executed successfully
         
           return res.status(200).json({message: "success" , data:payment});
          }
        });
   

})

// error page 
app.get('/err', (req, res) => {
   
    return res.status(404).json({ message: error.message });

})

// helper functions 
var createPay = (payment) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, function (err, payment) {
            if (err) {
                reject(err);
            }
            else {
                resolve(payment);
            }
        });
    });
}


app.listen(8585, (error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log("Server is running on port 8585");
    }
})

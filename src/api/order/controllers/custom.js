
const { createCoreController } = require('@strapi/strapi').factories;
const https = require('https');
const PaytmChecksum = require('paytmchecksum');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  async exampleAction(ctx) {

    var paytmParams = {};
    console.log(ctx.request.body);
    // let params = JSON.parse(ctx.request.body)
    let params = ctx.request.body

    paytmParams.body = {
      "requestType": "Payment",
      "mid": process.env.MID,
      "websiteName": "YOUR_WEBSITE_NAME",
      "orderId": params.orderId,
      "callbackUrl": "https://127.0.0.1:1337/api/orders/posttransaction",
      "txnAmount": {
        "value": params.amount,
        "currency": "INR",
      },
      "userInfo": {
        "custId": "CUST_001",
      },
    };


    let checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.MKEY)

    paytmParams.head = {
      "signature": checksum
    };
    const gettoken = async () => {
      return new Promise((resolve, reject) => {
        var post_data = JSON.stringify(paytmParams);
        var options = {

          hostname: 'securegw.paytm.in',

          port: 443,
          path: `/theia/api/v1/initiateTransaction?mid=${process.env.MID}&orderId=${params.orderId}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
          }
        };
        console.log(process.env.MID);
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on('data', function (chunk) {
            response += chunk;
          });

          post_res.on('end', function () {
            console.log('Response: ', response);
            resolve(response)
          });
        });

        post_req.write(post_data);
        post_req.end();
      })

    }
    let myr = await gettoken();
    ctx.send(JSON.parse(myr));
  },
}));
var schedule = require('node-schedule');
var Campaign = require('../schema/Campaign');

var PaymentModel = require('../models/payment');





module.exports = {
 startScheduledPayout: function() {
   console.log('starting payouts');
   
    var j = schedule.scheduleJob('*/1 * * * *', function(){
      Campaign.find({}).then(function(campaignList){
        campaignList.forEach(function(campaign){
          campaign.marketers.forEach(function(marketer){
            // Perform instant distribution
            const fromAccount = campaign.publisherWalletAddress;
            const toAccount = marketer.userAddress;
            console.log("From "+fromAccount);
            console.log("To "+toAccount);
            
            PaymentModel.performInstantDistribution(fromAccount, toAccount, 1).then(function(response){
              console.log("Finish perform instant distribution");
            })
          })
          
          
        })
      })
    });

 } 
}
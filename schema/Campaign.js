var DBConnection = require('./common');

const mongoose = DBConnection.getDBConnectionString()

var campaign = new mongoose.Schema({
    publisherWalletAddress: String,
    publisherUserAddress: String,
    marketLink: String,
    payoutInterval: String,
    payoutIntervalUnit: String,
    likePayout: String,
    retweetPayout: String,
    commentPayout: String,
    marketers: [{'campaignLink': String, 'userAddress': String}],
    createdAt: Date,
    lastPayment: Date,
    
   });
  
var Campaign = mongoose.model('Campaign', campaign);




module.exports = Campaign;
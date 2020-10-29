var Campaign = require('../schema/Campaign');
module.exports = {
  submitCampaignDetails: function(payload) {
    var campaign = new Campaign(payload);
    return campaign.save({}).then(function(saveResponse){
      return saveResponse;
    })
  },
  getOpenCampaigns: function() {
    return Campaign.find({}).then(function(campaigns){
      return campaigns;
    })
  },
  getCurrentCampaign: function(id) {
    return Campaign.findOne({'_id': id}).then(function(campaign){
      return campaign;
    })
  },
  joinCampaign: function(payload) {
     console.log("joining campaign");
    const campaignData = {'campaignLink': payload.campaignLink, 'userAddress': payload.userAddress}
    return Campaign.findOne({'_id': payload._id}).then(function(campaign){
      if (campaign.marketers) {
        campaign.marketers.push(campaignData);
      } else {
        campaign.marketers = [campaignData]
      }
      return campaign.save({}).then(function(saveRes){
        return saveRes;
      })
    });
  }
}
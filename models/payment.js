let accounts;
let minAmount;
let web3;
let dai;
let daix;
let sfObject;


module.exports = {
  
  setup: function() {
    setupWeb3Instance();
    setupSFProvider().then(function(response){
      setupFDai().then(function(){
        setupDaiX();
      })
    })
  },
  
  // Test function 
  testFlow: function() {

    const newAccount = createNewAccount();

    web3.eth.accounts.wallet.add(newAccount.privateKey);

    web3.eth.accounts.privateKeyToAccount(newAccount.privateKey);

    web3.eth.personal.newAccount("test password!").then(function(newAccount){
      web3.eth.personal.unlockAccount(newAccount, "test password!", 6000000)
      .then(function(res){
            mintTokensForAccount(newAccount).then(function(response){
            console.log("SUCCESS");
          })
      });


    })


    return new Promise((resolve, reject) => (resolve(1)));
  },
  
  getPaymentProvider: function() {
   // setupPaymentProvider();
    return initializePaymentProvider().then(function(response){
      return;
    })
  },
  
  setupSFProvider: function() {
  //  setupPaymentProvider();
  },
  
  getAdminAccountBalance: function() {
    return getAdminBalance().then(function(response){
      return response;
    })
  },
  mintTokens: function() {
    return mintTokens().then(function(response){
      return response;
    })
  },
  getNetFlow: function(account) {
    return getNetFlow(account).then(function(response){
      return response;
    })
  },
  createNewFlow: function(account) {
    return createNewIDAFlow(account).then(function(response){
      return response;
    })
  },
  createNewAccount: function() {
   return createNewAccount().then(function(response){
      return response;
    })

  },
  
  createNewFlowForNewAccount: function() {
    const account = createNewAccount();
    getDaiX().then(function(getDaiXResponse){
      return mintTokens(account.address).then(function(mintResponse){
       createNewIDAFlow(account.address);
      });
    });
  },
  
  setupWeb3Provider: function() {
    const HDWalletProvider = require("@truffle/hdwallet-provider");
    const Web3 = require("web3");
    if (!process.env.WEB3_MNEMONIC ||
        !process.env.WEB3_PROVIDER) {
      console.error("add GOERLI_MNEMONIC and GOERLI_PROVIDER_URL to your .env file");
      process.exit(1);
    }
    

    web3 = new Web3(process.env.WEB3_PROVIDER);
  },
  
  generateFundsForAccount: function(account) {
     return mintTokensForAccount(account).then(function(response){
      return {'funds': response, 'address': account};
    })
  },
  
  performInstantDistribution: function(fromAccount, toAccount, amount) {
    return performInstantDistribution(fromAccount, toAccount, amount).then(function(response){
      return response;
    })
  },
  
  getUserBalance: function(account) {
    return getUserBalance(account).then(function(userBalance){
      return userBalance;
    })
  }

}

// private functions

function createPublishingIndex(account) {
  const sf = sfObject;
  return sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, 42, "0x").encodeABI(), { from: account }).then(function(response){
    return response;
  })
}






function initializePaymentProvider () {
  return sfObject.initialize().then(function(sfResponse){
    return sfResponse;
  });
}

function getDaiX() {
  const sf = sfObject;

  return sfObject.resolver.get("tokens.fDAI").then(function(daiAddress){
    return sf.contracts.TestToken.at(daiAddress).then(function(daiContract){
      dai = daiContract;
      return sf.getERC20Wrapper(daiContract).then(function(daixWrapper){
        return sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress).then(function(daiX){
          daix = daiX;
          return daiX;
        })
      });
    });
  });
}

function getAdminBalance() {
 const  admin = accounts[0];
  const bob = accounts[1];
  return getDaiX().then(function(daix){
    return daix.balanceOf(admin).then(function(adminBalance){
      return web3.utils.toBN(adminBalance);
    })
  })
}

function mintTokens(account) {
  return dai.mint(account, minAmount, {from: account}).then(function(daiMint){
    return dai.approve(daix.address, minAmount, {from: account}).then(function(response){
      return daix.upgrade(minAmount, {from: account}).then(function(response){
        console.log('done minting and upgrading');
        return response;
      })
    })
  });
}


function createNewIDAFlow(account){
 return sfObject.host.callAgreement(
    sfObject.agreements.ida.address,
    sfObject.agreements.ida.contract.methods.createIndex(daix.address, 42, "0x").encodeABI(), { from: account })
    .then(function(createFlowResponse){

      return createFlowResponse
    }).catch(function(err){
      console.log(err);
    });


}



function updateFlow() {
  return sfObject.host.callAgreement(
    sfObject.agreements.ida.address,
    sfObject.agreements.ida.contract.methods
      .updateIndex(daix.address, 42, web3.utils.toWei("0.01", "ether"), "0x").encodeABI(), { from: bob })
}









// New private functions

function createNewAccount() {
    return web3.eth.personal.newAccount("test password!").then(function(newAccount){
      return web3.eth.personal.unlockAccount(newAccount, "test password!", 6000000).then(function(res){
        return newAccount;
      });
    });
}

function getNetFlow(account) {
    const sf = sfObject;
    const acccountAddress = web3.utils.toChecksumAddress(account);
    return sf.agreements.cfa.getNetFlow(daix.address, acccountAddress).then(function(response){
      return response;
    })
}

function setupWeb3Instance() {
  const Web3 = require("web3");
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
}

function setupSFProvider() {
  if (sfObject !== undefined ) {
    return new Promise((resolve) => (resolve(sfObject)));
  } else {
    const SuperfluidSDK = require("@superfluid-finance/ethereum-contracts");
    const sfInit = new SuperfluidSDK.Framework({version: "preview-20200928", web3Provider: web3.currentProvider, chainId: 5 });
    return sfInit.initialize().then(function(response){
      sfObject = sfInit;
      return;
    }).catch(function(err){
      console.log(err);
   })
  }  
}

function setupFDai() {
  const sf = sfObject;
  return sfObject.resolver.get("tokens.fDAI").then(function(daiAddress){
    return sf.contracts.TestToken.at(daiAddress).then(function(daiContract){
      dai = daiContract;
      console.log('generated Dai contract');
      return; 
    });
  });
}

function setupDaiX() {
  const sf = sfObject;
 return sf.getERC20Wrapper(dai).then(function(daixWrapper){
  return sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress).then(function(daixObject){
    daix = daixObject;
    console.log('Generated DaiX contract');
    return;
  });
 });
}

function mintTokensForAccount(account) {

    const sf = sfObject;
    const minAmount = web3.utils.toBN(web3.utils.toWei("100", "ether"));
    dai.mint(account, minAmount, { from: account })
    
    return dai.approve(daix.address, minAmount, { from: account }).then(function(response){
      return daix.upgrade(minAmount, { from: account }).then(function(daixResponse){
        return daix.balanceOf(account).then(function(response){
          return sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.createIndex(daix.address, 42, "0x").encodeABI(), { from: account })
          .then(function(createIndexResponse){

            
   
          return response.toString();
          
     
          });
        })
      })
    })
}


function performInstantDistribution(accountFrom, accountTo, amount) {
  const sf = sfObject;
  
  return sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.updateSubscription(daix.address, 42, accountTo, 100, "0x").encodeABI(), { from: accountFrom })
  .then(function(response){
    
    return sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.updateIndex(daix.address, 42, web3.utils.toWei("0.01", "ether"), "0x").encodeABI(), { from: accountFrom })
    .then(function(dataRes){
  
    return dataRes;
    
        
    })
  })  
}

function getUserBalance(address) {
  return daix.balanceOf(address).then(function(balanceResponse){
    return balanceResponse.toString();
  })
}

function createFlow(accountFrom, accountTo) {
  const sf = sfObject;
  return sf.host.callAgreement(sf.agreements.ida.address, sf.agreements.ida.contract.methods.updateSubscription(daix.address, 42, accountTo, 100, "0x").encodeABI(), { from: accountFrom })
  .then(function(response){
    
    
    return response;
  })    
}
import config from "../config";
import async from 'async';
import * as moment from 'moment';
import {
  ERROR,
  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES,
  GET_BALANCES_RETURNED,
  GET_BALANCES_PERPETUAL,
  GET_BALANCES_PERPETUAL_RETURNED,
  STAKE,
  STAKE_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_REWARDS,
  GET_REWARDS_RETURNED,
  EXIT,
  EXIT_RETURNED,
  PROPOSE,
  PROPOSE_RETURNED,
  GET_PROPOSALS,
  GET_PROPOSALS_RETURNED,
  VOTE_FOR,
  VOTE_FOR_RETURNED,
  VOTE_AGAINST,
  VOTE_AGAINST_RETURNED,
  GET_CLAIMABLE_ASSET,
  GET_CLAIMABLE_ASSET_RETURNED,
  CLAIM,
  CLAIM_RETURNED,
  GET_CLAIMABLE,
  GET_CLAIMABLE_RETURNED,
  GET_YCRV_REQUIREMENTS,
  GET_YCRV_REQUIREMENTS_RETURNED,
  REGISTER_VOTE,
  REGISTER_VOTE_RETURNED,
  GET_VOTE_STATUS,
  GET_VOTE_STATUS_RETURNED
} from '../constants';
import Web3 from 'web3';

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors";

import { MathWallet } from './mathwallet';
import { Hmy } from '../blockchain';

const rp = require('request-promise');
const ethers = require('ethers');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    const hmy = new Hmy('testnet');

    this.store = {
      votingStatus: false,
      governanceContractVersion: 2,
      currentBlock: 0,
      universalGasPrice: '70',
      account: {},
      web3: null,
      hmy: hmy,
      mathwallet: new MathWallet(hmy.client),
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
      },
      web3context: null,
      languages: [
        {
          language: 'English',
          code: 'en'
        },
        {
          language: 'Japanese',
          code: 'ja'
        },
        {
          language: 'Chinese',
          code: 'zh'
        }
      ],
      proposals: [
      ],
      claimableAsset: {
        id: 'yfi',
        name: '1earn.finance',
        address: config.addresses.onefi,
        abi: require('../contracts/OneFI.json').abi,
        symbol: '1FI',
        balance: 0,
        decimals: 18,
        rewardAddress: '0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d',
        rewardSymbol: 'aDAI',
        rewardDecimals: 18,
        claimableBalance: 0
      },
      rewardPools: [
        {
          id: 'yearn',
          name: '1CRV',
          website: 'curve.fi/y',
          link: 'https://curve.fi/y',
          depositsEnabled: true,
          tokens: [
            {
              id: 'ycurvefi',
              address: config.addresses.onecrv,
              symbol: '1CRV',
              abi: require('../contracts/ERC20.json').abi,
              decimals: 18,
              rewardsAddress: config.addresses.rewards,
              rewardsABI: require('../contracts/OneEarnRewards.json').abi,
              rewardsSymbol: '1FI',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              rewardsAvailable: 0
            }
          ]
        },
        /*{
          id: 'Balancer',
          name: 'Balancer',
          website: 'pools.balancer.exchange',
          link: 'https://pools.balancer.exchange/#/pool/0x60626db611a9957C1ae4Ac5b7eDE69e24A3B76c5',
          depositsEnabled: false,
          tokens: [
            {
              id: 'bpt',
              address: '0x60626db611a9957C1ae4Ac5b7eDE69e24A3B76c5',
              symbol: 'BPT',
              abi: config.erc20ABI,
              decimals: 18,
              rewardsAddress: config.balancerRewardsAddress,
              rewardsABI: config.balancerRewardsABI,
              rewardsSymbol: 'YFI',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              rewardsAvailable: 0
            }
          ]
        },
        {
          id: 'Governance',
          name: 'Governance',
          website: 'pools.balancer.exchange',
          link: 'https://pools.balancer.exchange/#/pool/0x95c4b6c7cff608c0ca048df8b81a484aa377172b',
          depositsEnabled: false,
          tokens: [
            {
              id: 'bpt',
              address: '0x95c4b6c7cff608c0ca048df8b81a484aa377172b',
              symbol: 'BPT',
              abi: config.bpoolABI,
              decimals: 18,
              rewardsAddress: config.governanceAddress,
              rewardsABI: config.governanceABI,
              rewardsSymbol: 'YFI',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              rewardsAvailable: 0
            }
          ]
        },
        {
          id: 'FeeRewards',
          name: 'Fee Rewards',
          website: 'ygov.finance',
          link: 'https://ygov.finance/',
          depositsEnabled: false,
          tokens: [
            {
              id: 'yfi',
              address: config.addresses.onefi,
              symbol: 'YFI',
              abi: config.yfiABI,
              decimals: 18,
              rewardsAddress: config.feeRewardsAddress,
              rewardsABI: config.feeRewardsABI,
              rewardsSymbol: '$',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              rewardsAvailable: 0
            }
          ]
        },*/
        {
          id: 'GovernanceV2',
          name: 'Governance',
          website: '1earn.finance',
          link: 'https://1earn.finance/',
          depositsEnabled: true,
          tokens: [
            {
              id: 'yfi',
              address: config.addresses.onefi,
              symbol: '1FI',
              abi: require('../contracts/OneFI.json').abi,
              decimals: 18,
              rewardsAddress: config.addresses.governance,
              rewardsABI: require('../contracts/OneEarnGovernance.json').abi,
              rewardsSymbol: '$',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              rewardsAvailable: 0
            }
          ]
        }
      ]
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE:
            this.configure(payload);
            break;
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case GET_BALANCES_PERPETUAL:
            this.getBalancesPerpetual(payload);
            break;
          case STAKE:
            this.stake(payload);
            break;
          case WITHDRAW:
            this.withdraw(payload);
            break;
          case GET_REWARDS:
            this.getReward(payload);
            break;
          case EXIT:
            this.exit(payload);
            break;
          case PROPOSE:
            this.propose(payload)
            break;
          case GET_PROPOSALS:
            this.getProposals(payload)
            break;
          case REGISTER_VOTE:
            this.registerVote(payload)
            break;
          case GET_VOTE_STATUS:
            this.getVoteStatus(payload)
            break;
          case VOTE_FOR:
            this.voteFor(payload)
            break;
          case VOTE_AGAINST:
            this.voteAgainst(payload)
            break;
          case GET_CLAIMABLE_ASSET:
            this.getClaimableAsset(payload)
            break;
          case CLAIM:
            this.claim(payload)
            break;
          case GET_CLAIMABLE:
            this.getClaimable(payload)
            break;
          case GET_YCRV_REQUIREMENTS:
            this.getYCRVRequirements(payload)
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    // console.log(this.store)
    return emitter.emit('StoreUpdated');
  };

  configure = async () => {
    const hmy = store.getStore('hmy');
    let currentBlock = await hmy.getBlockNumber();

    store.setStore({ currentBlock: currentBlock });

    /*const web3 = new Web3(store.getStore('web3context').library.provider);
    const currentBlock = await web3.eth.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })*/

    window.setTimeout(() => {
      emitter.emit(CONFIGURE_RETURNED)
    }, 100)
  }

  getBalancesPerpetual = async () => {
    const pools = store.getStore('rewardPools');
    const account = store.getStore('account');

    const hmy = store.getStore('hmy');

    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const currentBlock = await web3.eth.getBlockNumber()

    const currentBlock = await hmy.getBlockNumber();

    store.setStore({ currentBlock: currentBlock })

    async.map(pools, (pool, callback) => {

      async.map(pool.tokens, (token, callbackInner) => {

        async.parallel([
          (callbackInnerInner) => { this._getERC20Balance(hmy, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getstakedBalance(hmy, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getRewardsAvailable(hmy, token, account, callbackInnerInner) }
        ], (err, data) => {
          if(err) {
            console.log(err)
            return callbackInner(err)
          }

          token.balance = data[0]
          token.stakedBalance = data[1]
          token.rewardsAvailable = data[2]

          callbackInner(null, token)
        })
      }, (err, tokensData) => {
        if(err) {
          console.log(err)
          return callback(err)
        }

        pool.tokens = tokensData
        callback(null, pool)
      })

    }, (err, poolData) => {
      if(err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }
      store.setStore({rewardPools: poolData})
      emitter.emit(GET_BALANCES_PERPETUAL_RETURNED)
      emitter.emit(GET_BALANCES_RETURNED)
    })
  }

  getBalances = () => {
    const pools = store.getStore('rewardPools')
    const account = store.getStore('account')

    const hmy = store.getStore('hmy');

    //const web3 = new Web3(store.getStore('web3context').library.provider);

    async.map(pools, (pool, callback) => {

      async.map(pool.tokens, (token, callbackInner) => {

        async.parallel([
          (callbackInnerInner) => { this._getERC20Balance(hmy, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getstakedBalance(hmy, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getRewardsAvailable(hmy, token, account, callbackInnerInner) }
        ], (err, data) => {
          if(err) {
            console.log(err)
            return callbackInner(err)
          }

          token.balance = data[0]
          token.stakedBalance = data[1]
          token.rewardsAvailable = data[2]

          callbackInner(null, token)
        })
      }, (err, tokensData) => {
        if(err) {
          console.log(err)
          return callback(err)
        }

        pool.tokens = tokensData
        callback(null, pool)
      })

    }, (err, poolData) => {
      if(err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }

      store.setStore({rewardPools: poolData})
      emitter.emit(GET_BALANCES_RETURNED)
    })
  }

  _checkApproval = async (asset, account, amount, contract, callback) => {
    try {
      //const web3 = new Web3(store.getStore('web3context').library.provider);
      //const erc20Contract = new web3.eth.Contract(asset.abi, asset.address)

      const hmy = store.getStore('hmy');
      const wallet = store.getStore('mathwallet');
      let erc20Contract = hmy.client.contracts.createContract(asset.abi, asset.address);
      erc20Contract = wallet.attachToContract(erc20Contract);

      const allowance = await erc20Contract.methods.allowance(account.address, contract).call(hmy.gasOptions())

      const ethAllowance = Web3.utils.fromWei(allowance, "ether")

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        await erc20Contract.methods.approve(contract, Web3.utils.toWei("999999999999999", "ether")).send({ ...hmy.gasOptions(), from: account.address })
        callback()
      } else {
        callback()
      }
    } catch(error) {
      console.log(error)
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApprovalWaitForConfirmation = async (asset, account, amount, contract, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.address)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let erc20Contract = hmy.client.contracts.createContract(require('../contracts/ERC20.json').abi, asset.address);
    erc20Contract = wallet.attachToContract(erc20Contract);
    
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call(hmy.gasOptions())

    const ethAllowance = Web3.utils.fromWei(allowance, "ether")

    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      await erc20Contract.methods.approve(contract, Web3.utils.toWei("999999999999999", "ether")).send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          callback()
        } else {
          callback(null);
        }
      });
        /*.on('transactionHash', function(hash){
          callback()
        })
        .on('error', function(error) {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })*/
    } else {
      callback()
    }
  }

  _getERC20Balance = async (hmy, asset, account, callback) => {
    let erc20Contract = hmy.client.contracts.createContract(require('../contracts/ERC20.json').abi, asset.address)

    try {
      var balance = await erc20Contract.methods.balanceOf(account.address).call(hmy.gasOptions());
      balance = parseFloat(balance)/10**asset.decimals
      callback(null, parseFloat(balance))
    } catch(ex) {
      return callback(ex)
    }
  }

  _getstakedBalance = async (hmy, asset, account, callback) => {
    //let erc20Contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    let erc20Contract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress)

    try {
      var balance = await erc20Contract.methods.balanceOf(account.address).call(hmy.gasOptions());
      balance = parseFloat(balance)/10**asset.decimals
      callback(null, parseFloat(balance))
    } catch(ex) {
      return callback(ex)
    }
  }

  _getRewardsAvailable = async (hmy, asset, account, callback) => {
    //let erc20Contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    let erc20Contract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress)

    try {
      var earned = await erc20Contract.methods.earned(account.address).call(hmy.gasOptions());
      earned = parseFloat(earned)/10**asset.decimals
      callback(null, parseFloat(earned))
    } catch(ex) {
      return callback(ex)
    }
  }

  _checkIfApprovalIsNeeded = async (asset, account, amount, contract, callback, overwriteAddress) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //let erc20Contract = new web3.eth.Contract(config.erc20ABI, (overwriteAddress ? overwriteAddress : asset.address))

    const hmy = store.getStore('hmy');
    let erc20Contract = hmy.client.contracts.createContract(require('../contracts/ERC20.json').abi, (overwriteAddress ? overwriteAddress : asset.address));
    
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call(hmy.gasOptions())

    const ethAllowance = Web3.utils.fromWei(allowance, "ether")
    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      asset.amount = amount
      callback(null, asset)
    } else {
      callback(null, false)
    }
  }

  _callApproval = async (asset, account, amount, contract, last, callback, overwriteAddress) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //let erc20Contract = new web3.eth.Contract(config.erc20ABI, (overwriteAddress ? overwriteAddress : asset.address))
    
    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let erc20Contract = hmy.client.contracts.createContract(require('../contracts/ERC20.json').abi, (overwriteAddress ? overwriteAddress : asset.address));
    erc20Contract = wallet.attachToContract(erc20Contract);
    
    try {
      if(last) {
        await erc20Contract.methods.approve(contract, Web3.utils.toWei("999999999999999", "ether")).send({ ...hmy.gasOptions(), from: account.address })
        .then((res) => {
          if (res.status === 'called' || res.status === 'call') {
            callback()
          } else {
            callback(null);
          }
        });
      } else {
        erc20Contract.methods.approve(contract, Web3.utils.toWei("999999999999999", "ether")).send({ ...hmy.gasOptions(), from: account.address })
        .then((res) => {
          if (res.status === 'called' || res.status === 'call') {
            callback()
          } else {
            callback(null);
          }
        });
        
        /*.on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })*/
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  stake = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content

    this._checkApproval(asset, account, amount, asset.rewardsAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callStake(asset, account, amount, (err, res) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(STAKE_RETURNED, res)
      })
    })
  }

  _callStake = async (asset, account, amount, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');

    let rewardsContract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress);
    rewardsContract = wallet.attachToContract(rewardsContract);

    var amountToSend = Web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount*10**asset.decimals).toFixed(0);
    }

    await rewardsContract.methods.stake(amountToSend).send({ ...hmy.gasOptions(), from: account.address })
    .then((res) => {
      if (res.status === 'called' || res.status === 'call') {
        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        callback(null, res.transaction.receipt.transactionHash);
      } else {
        callback("Transaction failed! Please try again.");
      }
    });

    /*yCurveFiContract.methods.stake(amountToSend).send(hmy.gasOptions())
      .on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  withdraw = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content

    this._callWithdraw(asset, account, amount, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(WITHDRAW_RETURNED, res)
    })
  }

  _callWithdraw = async (asset, account, amount, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');

    let yCurveFiContract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress);
    yCurveFiContract = wallet.attachToContract(yCurveFiContract);
    
    var amountToSend = Web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount*10**asset.decimals).toFixed(0);
    }

    await yCurveFiContract.methods.withdraw(amountToSend).send({ ...hmy.gasOptions(), from: account.address })
    .then((res) => {
      if (res.status === 'called' || res.status === 'call') {
        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        callback(null, res.transaction.receipt.transactionHash);
      } else {
        if (asset.symbol == "1FI") {
          callback("Transaction failed! Are you sure that you are eligible to withdraw your tokens?");
        } else {
          callback("Transaction failed! Please try again.");
        }
      }
    });
    
    /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/

  }

  getReward = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    this._callGetReward(asset, account, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(GET_REWARDS_RETURNED, res)
    })
  }

  _callGetReward = async (asset, account, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let yCurveFiContract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress);
    yCurveFiContract = wallet.attachToContract(yCurveFiContract);

    await yCurveFiContract.methods.getReward().send({ ...hmy.gasOptions(), from: account.address })
    .then((res) => {
      if (res.status === 'called' || res.status === 'call') {
        dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        callback(null, res.transaction.receipt.transactionHash)
      } else {
        callback("Transaction failed! Please try again.");
      }
    });

    /*  .on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  exit = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    this._callExit(asset, account, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(EXIT_RETURNED, res)
    })
  }

  _callExit = async (asset, account, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let yCurveFiContract = hmy.client.contracts.createContract(asset.rewardsABI, asset.rewardsAddress);
    yCurveFiContract = wallet.attachToContract(yCurveFiContract);

    await yCurveFiContract.methods.exit().send({ ...hmy.gasOptions(), from: account.address })
    .then((res) => {
      if (res.status === 'called' || res.status === 'call') {
        dispatcher.dispatch({ type: GET_BALANCES, content: {} });
        callback(null, res.transaction.receipt.transactionHash);
      } else {
        callback("Transaction failed! Please try again.");
      }
    });

    /*
      .on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  propose = (payload) => {
    const account = store.getStore('account')
    const { executor, hash } = payload.content

    this._callPropose(account, executor, hash, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(PROPOSE_RETURNED, res)
    })
  }

  _callPropose = async (account, executor, hash, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');

    const governanceContractVersion = store.getStore('governanceContractVersion')
    const abi = governanceContractVersion === 1 ? config.governanceABI  : require('../contracts/OneEarnGovernance.json').abi
    const address = governanceContractVersion === 1 ? config.governanceAddress  : config.addresses.governance

    //const governanceContract = new web3.eth.Contract(abi,address)

    let governanceContract = hmy.client.contracts.createContract(abi, address);
    governanceContract = wallet.attachToContract(governanceContract);

    let call = null
    if(governanceContractVersion === 1) {
      call = governanceContract.methods.propose()
    } else {
      call = governanceContract.methods.propose(executor, hash)
    }

    call.send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
          callback(null, res.transaction.receipt.transactionHash);
        } else {
          callback("Transaction failed! Please try again.");
        }
      });

      /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  getProposals = (payload) => {
    // emitter.emit(GET_PROPOSALS_RETURNED)
    const account = store.getStore('account')
    //const web3 = new Web3(store.getStore('web3context').library.provider);

    const hmy = store.getStore('hmy');

    this._getProposalCount(hmy, account, (err, proposalCount) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      let arr = Array.from(Array(parseInt(proposalCount)).keys())

      if(proposalCount == 0) {
        arr = []
      }

      async.map(arr, (proposal, callback) => {
        this._getProposals(hmy, account, proposal, callback)
      }, (err, proposalsData) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        store.setStore({ proposals: proposalsData })
        emitter.emit(GET_PROPOSALS_RETURNED)
      })

    })
  }

  _getProposalCount = async (hmy, account, callback) => {
    try {

      const governanceContractVersion = store.getStore('governanceContractVersion')
      const abi = governanceContractVersion === 1 ? config.governanceABI  : require('../contracts/OneEarnGovernance.json').abi
      const address = governanceContractVersion === 1 ? config.governanceAddress  : config.addresses.governance

      //const governanceContract = new web3.eth.Contract(abi, address)

      const governanceContract = hmy.client.contracts.createContract(abi, address);

      var proposals = await governanceContract.methods.proposalCount().call(hmy.gasOptions());
      callback(null, proposals)
    } catch(ex) {
      return callback(ex)
    }
  }

  _getProposals = async (hmy, account, number, callback) => {
    try {

      const governanceContractVersion = store.getStore('governanceContractVersion')
      const abi = governanceContractVersion === 1 ? config.governanceABI  : require('../contracts/OneEarnGovernance.json').abi
      const address = governanceContractVersion === 1 ? config.governanceAddress  : config.addresses.governance

      //const governanceContract = new web3.eth.Contract(abi, address)

      const governanceContract = hmy.client.contracts.createContract(abi, address);

      var proposal = await governanceContract.methods.proposals(number).call(hmy.gasOptions());

      proposal.executor = governanceContractVersion === 1 ? '0x0000000000000000000000000000000000000000' : proposal.executor
      proposal.hash = governanceContractVersion === 1 ? 'na' : proposal.hash
      proposal.quorum = governanceContractVersion === 1 ? 'na' : proposal.quorum
      proposal.quorumRequired = governanceContractVersion === 1 ? 'na' : proposal.quorumRequired

      callback(null, proposal)
    } catch(ex) {
      return callback(ex)
    }
  }

  getVoteStatus = async (payload) => {
    try {
      const account = store.getStore('account')
      //const web3 = new Web3(store.getStore('web3context').library.provider);
      //const governanceContract = new web3.eth.Contract(config.governanceV2ABI,config.addresses.governance)

      const hmy = store.getStore('hmy');
      const governanceContract = hmy.client.contracts.createContract(require('../contracts/OneEarnGovernance.json').abi, config.addresses.governance);

      const status = await governanceContract.methods.voters(account.address).call(hmy.gasOptions())

      store.setStore({votingStatus: status})
      emitter.emit(GET_VOTE_STATUS_RETURNED, status)

    } catch(ex) {
      return emitter.emit(ERROR, ex);
    }
  }

  registerVote = (payload) => {
    const account = store.getStore('account')

    this._callRegisterVote(account, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(REGISTER_VOTE_RETURNED, res)
    })
  }

  _callRegisterVote = async (account, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const governanceContract = new web3.eth.Contract(config.governanceV2ABI, config.addresses.governance)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let governanceContract = hmy.client.contracts.createContract(require('../contracts/OneEarnGovernance.json').abi, config.addresses.governance);
    governanceContract = wallet.attachToContract(governanceContract);

    governanceContract.methods.register().send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          dispatcher.dispatch({ type: GET_VOTE_STATUS, content: {} })
          callback(null, res.transaction.receipt.transactionHash);
        } else {
          callback("Transaction failed! Please try again.");
        }
      });

      /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_VOTE_STATUS, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  voteFor = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteFor(proposal, account, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(VOTE_FOR_RETURNED, res)
    })
  }

  _callVoteFor = async (proposal, account, callback) => {
    const governanceContractVersion = store.getStore('governanceContractVersion')
    const abi = governanceContractVersion === 1 ? config.governanceABI  : require('../contracts/OneEarnGovernance.json').abi
    const address = governanceContractVersion === 1 ? config.governanceAddress  : config.addresses.governance

    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const governanceContract = new web3.eth.Contract(abi,address)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let governanceContract = hmy.client.contracts.createContract(abi, address);
    governanceContract = wallet.attachToContract(governanceContract);

    governanceContract.methods.voteFor(proposal.id).send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
          callback(null, res.transaction.receipt.transactionHash);
        } else {
          callback("Transaction failed! Please try again.");
        }
      });

      /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  voteAgainst = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteAgainst(proposal, account, (err, res) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(VOTE_AGAINST_RETURNED, res)
    })
  }

  _callVoteAgainst = async (proposal, account, callback) => {
    const governanceContractVersion = store.getStore('governanceContractVersion')
    const abi = governanceContractVersion === 1 ? config.governanceABI  : require('../contracts/OneEarnGovernance.json').abi
    const address = governanceContractVersion === 1 ? config.governanceAddress  : config.addresses.governance

    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const governanceContract = new web3.eth.Contract(abi,address)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');

    let governanceContract = hmy.client.contracts.createContract(abi, address);
    governanceContract = wallet.attachToContract(governanceContract);

    governanceContract.methods.voteAgainst(proposal.id).send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
          callback(null, res.transaction.receipt.transactionHash);
        } else {
          callback("Transaction failed! Please try again.");
        }
      });

      /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  getClaimableAsset = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')

    //const web3 = new Web3(store.getStore('web3context').library.provider);

    const hmy = store.getStore('hmy');

    async.parallel([
      (callbackInnerInner) => { this._getClaimableBalance(hmy, asset, account, callbackInnerInner) },
      (callbackInnerInner) => { this._getClaimable(hmy, asset, account, callbackInnerInner) },
    ], (err, data) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      asset.balance = data[0]
      asset.claimableBalance = data[1]

      store.setStore({claimableAsset: asset})
      emitter.emit(GET_CLAIMABLE_ASSET_RETURNED)
    })
  }

  _getClaimableBalance = async (hmy, asset, account, callback) => {
    //let erc20Contract = new web3.eth.Contract(asset.abi, asset.address)
    const erc20Contract = hmy.client.contracts.createContract(asset.abi, asset.address);

    try {
      var balance = await erc20Contract.methods.balanceOf(account.address).call(hmy.gasOptions());
      balance = parseFloat(balance)/10**asset.decimals
      callback(null, parseFloat(balance))
    } catch(ex) {
      return callback(ex)
    }
  }

  _getClaimable = async (hmy, asset, account, callback) => {
    //let claimContract = new web3.eth.Contract(config.claimABI, config.claimAddress)
    const claimContract = hmy.client.contracts.createContract(config.claimABI, config.claimAddress);

    try {
      var balance = await claimContract.methods.claimable(account.address).call(hmy.gasOptions());
      balance = parseFloat(balance)/10**asset.decimals
      callback(null, parseFloat(balance))
    } catch(ex) {
      return callback(ex)
    }
  }

  claim = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')
    const { amount } = payload.content

    this._checkApproval(asset, account, amount, config.claimAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callClaim(asset, account, amount, (err, res) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(CLAIM_RETURNED, res)
      })
    })
  }

  _callClaim = async (asset, account, amount, callback) => {
    //const web3 = new Web3(store.getStore('web3context').library.provider);
    //const claimContract = new web3.eth.Contract(config.claimABI, config.claimAddress)

    const hmy = store.getStore('hmy');
    const wallet = store.getStore('mathwallet');
    let claimContract = hmy.client.contracts.createContract(config.claimABI, config.claimAddress);
    claimContract = wallet.attachToContract(claimContract);
    
    var amountToSend = Web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount*10**asset.decimals).toFixed(0);
    }

    claimContract.methods.claim(amountToSend).send({ ...hmy.gasOptions(), from: account.address })
      .then((res) => {
        if (res.status === 'called' || res.status === 'call') {
          dispatcher.dispatch({ type: GET_CLAIMABLE_ASSET, content: {} })
          callback(null, res.transaction.receipt.transactionHash);
        } else {
          callback("Transaction failed! Please try again.");
        }
      });
      
      /*.on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
        if(confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_CLAIMABLE_ASSET, content: {} })
        }
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })*/
  }

  getClaimable = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')

    //const web3 = new Web3(store.getStore('web3context').library.provider);

    const hmy = store.getStore('hmy');

    async.parallel([
      (callbackInnerInner) => { this._getClaimableBalance(hmy, asset, account, callbackInnerInner) },
      (callbackInnerInner) => { this._getClaimable(hmy, asset, account, callbackInnerInner) },
    ], (err, data) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      asset.balance = data[0]
      asset.claimableBalance = data[1]

      store.setStore({claimableAsset: asset})
      emitter.emit(GET_CLAIMABLE_RETURNED)
    })
  }

  getYCRVRequirements = async (payload) => {
    try {
      const account = store.getStore('account')

      //const web3 = new Web3(store.getStore('web3context').library.provider);
      //const governanceContract = new web3.eth.Contract(config.governanceABI,config.governanceAddress)

      const hmy = store.getStore('hmy');
      const governanceContract = hmy.client.contracts.createContract(require('../contracts/OneEarnGovernance.json').abi, config.addresses.governance);

      let balance = await governanceContract.methods.balanceOf(account.address).call(hmy.gasOptions())
      balance = parseFloat(balance)/10**18

      const voteLock = await governanceContract.methods.voteLock(account.address).call(hmy.gasOptions())
      const currentBlock = await hmy.getBlockNumber();

      const returnOBJ = {
        balanceValid: (balance > 1000),
        voteLockValid: voteLock > currentBlock,
        voteLock: voteLock
      }

      emitter.emit(GET_YCRV_REQUIREMENTS_RETURNED, returnOBJ)

    } catch(ex) {
      return emitter.emit(ERROR, ex);
    }
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};

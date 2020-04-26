/**
 * generic ERC20 token methods
 */
module.exports = class Token {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.tokens = _dsa.tokens;
    this.helpers = _dsa.helpers;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.errorHandler = _dsa.errorHandler;
    this.dsa = _dsa;
  }

  /**
   * Transfer
   * @param {symbol|address} _d.token
   * @param {number|string} _d.amount
   * @param {address} _d.to (optional) - default is DSA Address
   * @param {address} _d.from (optional) - default is User's Address
   * @param {number|string} _d.gasPrice (optional)
   * @param {number|string} _d.gas (optional)
   */
  async transfer(_d) {
    this.errorHandler.checkWeb3(this.web3) // check if web3 is configured properly
    let _addr = await this.internal.getAddress();
    let web3 = this.web3;
    if (!_d.token) throw new Error("'token' is not defined.");
    if (!_d.to) {
      let _dsa = !this.dsa ? this : this.dsa
      _d.to = _dsa.instance.address;
      if(_d.to == _dsa.address.genesis) throw new Error("'to' is not defined and instance is not set.");
    }
    if (!_d.amount) throw new Error("'amount' is not defined");
    if (!_d.from) _d.from = _addr;
    if (
      _d.token.toLowerCase() == "eth" ||
      _d.token.toLowerCase() == this.tokens.info.eth.address
    ) {
      return new Promise((resolve, reject) => {
        return web3.eth
          .sendTransaction({
            from: _d.from,
            to: _d.to,
            value: _d.amount,
          })
          .on("transactionHash", (txHash) => {
            resolve(txHash);
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    } else {
      var _c = await new web3.eth.Contract(
        this.ABI.basic.erc20,
        this.helpers.getAddress(_d.token)
      );
      return new Promise((resolve, reject) => {
        return _c.methods
          .transfer(_d.to, this.helpers.bigNumInString(_d.amount)) 
          .send(_d)
          .on("transactionHash", (txHash) => {
            resolve(txHash);
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    }
  }

  /**
   * Approve Token
   * @param {symbol|address} _d.token
   * @param {number|string} _d.amount
   * @param {address} _d.to
   * @param {address} _d.from (optional)
   * @param {number|string} _d.gasPrice (optional)
   * @param {number|string} _d.gas (optional)
   */
  async approve(_d) {
    this.errorHandler.checkWeb3(this.web3) // check if web3 is configured properly
    let _addr = await this.internal.getAddress();
    let web3 = this.web3;
    if (!_d.token) throw new Error("'token' is not defined.");
    if (!_d.to) throw new Error("'to' address is not defined");
    if (!_d.amount) throw new Error("'amount' is not defined");
    if (!_d.from) _d.from = _addr;

    if (
      _d.token.toLowerCase() == "eth" ||
      _d.token.toLowerCase() == this.tokens.info.eth.address
    ) {
      return new Promise((resolve, reject) => {
        resolve("ETH does not require approve.");
      });
    } else {
      var _c = await new web3.eth.Contract(
        this.ABI.basic.erc20,
        this.helpers.getAddress(_d.token)
      );
      return new Promise((resolve, reject) => {
        return _c.methods
          .approve(_d.to, _d.amount)
          .send(_d)
          .on("transactionHash", (txHash) => {
            resolve(txHash);
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    }
  }

  /**
   * Get Allowance
   * @param {symbol|address} _d.token
   * @param {address} _d.to
   * @param {address} _d.from (optional)
   */
  async getAllowance(_d) {
    this.errorHandler.checkWeb3(this.web3) // check if web3 is configured properly
    let _addr = await this.internal.getAddress();
    let web3 = this.web3;
    if (!_d.token) throw new Error("'token' is not defined.");
    if (!_d.to) throw new Error("'to' address is not defined");
    if (!_d.from) _d.from = _addr;

    if (
      _d.token.toLowerCase() == "eth" ||
      _d.token.toLowerCase() == this.tokens.info.eth.address
    ) {
      return new Promise((resolve, reject) => {
        resolve("ETH does not have allowance.");
      });
    } else {
      var _c = await new web3.eth.Contract(
        this.ABI.basic.erc20,
        this.helpers.getAddress(_d.token)
      );
      return new Promise(function (resolve, reject) {
        return _c.methods
          .allowance(_d.from, _d.to)
          .call()
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
  }
};

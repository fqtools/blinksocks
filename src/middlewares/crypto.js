import {
  MIDDLEWARE_DIRECTION_UPWARD,
  MIDDLEWARE_DIRECTION_DOWNWARD,
  IMiddleware,
  checkMiddleware
} from './interface';

const Logger = require('../utils/logger')(__filename);

export class CryptoMiddleware extends IMiddleware {

  _impl = null;

  constructor(props) {
    super(props);
    try {
      const CryptoImplClass = require(`../presets/crypto/${__CRYPTO__}`).default;
      const params = __CRYPTO_PARAMS__.split(',').filter((param) => param.length > 0);
      const impl = new CryptoImplClass(...params);
      if (checkMiddleware(__CRYPTO__, impl)) {
        this._impl = impl;
      }
    } catch (err) {
      Logger.fatal(err.message);
      process.exit(-1);
    }
  }

  write(direction, buffer) {
    const next = (buf) => this.next(direction, buf);
    const args = {buffer, next, broadcast: this.broadcast};

    let ret = null;

    if (__IS_CLIENT__ && direction === MIDDLEWARE_DIRECTION_UPWARD) {
      ret = this._impl.clientOut(args);
    }

    if (__IS_SERVER__ && direction === MIDDLEWARE_DIRECTION_DOWNWARD) {
      ret = this._impl.serverIn(args);
    }

    if (__IS_SERVER__ && direction === MIDDLEWARE_DIRECTION_UPWARD) {
      ret = this._impl.serverOut(args);
    }

    if (__IS_CLIENT__ && direction === MIDDLEWARE_DIRECTION_DOWNWARD) {
      ret = this._impl.clientIn(args);
    }

    if (ret !== null && typeof ret !== 'undefined') {
      next(ret);
    }
  }

}
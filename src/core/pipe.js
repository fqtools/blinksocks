import EventEmitter from 'events';
import {MIDDLEWARE_DIRECTION_UPWARD} from './middleware';
import {PRESET_FAILED} from '../presets/defs';
import {logger} from '../utils';

// .on('broadcast')
// .on(`pre_${direction}`)
// .on(`post_${direction}`)
export class Pipe extends EventEmitter {

  _upstream_middlewares = [];

  _downstream_middlewares = [];

  _cacheBuffer = null;

  _destroyed = false;

  get destroyed() {
    return this._destroyed;
  }

  constructor() {
    super();
    this.broadcast = this.broadcast.bind(this);
  }

  broadcast(name, action) {
    const middlewares = this.getMiddlewares();
    const results = [];
    for (const middleware of middlewares) {
      if (middleware.name !== name) {
        results.push(middleware.notify(action));
      }
    }
    // if no middleware handled this action, bubble up to where pipe created.
    if (name !== 'pipe' && results.every((result) => !!result === false)) {
      this.emit('broadcast', action);
    }
  }

  setMiddlewares(middlewares) {
    // set listeners
    for (const middleware of middlewares) {
      middleware.setMaxListeners(4);
      middleware.on('broadcast', this.broadcast);
      middleware.on('fail', (name, message) => void this.broadcast(name, {
        type: PRESET_FAILED,
        payload: {
          name,
          message,
          orgData: this._cacheBuffer
        }
      }));
    }
    this._upstream_middlewares = middlewares;
    this._downstream_middlewares = [].concat(middlewares).reverse();
  }

  getMiddlewares(direction = MIDDLEWARE_DIRECTION_UPWARD) {
    if (direction === MIDDLEWARE_DIRECTION_UPWARD) {
      return this._upstream_middlewares;
    } else {
      return this._downstream_middlewares;
    }
  }

  feed(direction, buffer) {
    try {
      // cache the current buffer for PRESET_FAILED action
      this._cacheBuffer = buffer;
      // pre-feed hook
      const preEventName = `pre_${direction}`;
      if (this.listenerCount(preEventName) > 0) {
        this.emit(preEventName, buffer, (buf) => this._feed(direction, buf));
      } else {
        this._feed(direction, buffer);
      }
    } catch (err) {
      logger.error(`[pipe] error occurred while piping: ${err.message}`);
    }
  }

  destroy() {
    const middlewares = this.getMiddlewares();
    for (const middleware of middlewares) {
      middleware.onDestroy();
    }
    this._upstream_middlewares = null;
    this._downstream_middlewares = null;
    this._cacheBuffer = null;
    this._destroyed = true;
    this.removeAllListeners();
  }

  _feed(direction, buffer) {
    const middlewares = this.getMiddlewares(direction);
    // methods to be injected
    const direct = (buf, isReverse = false) => this.emit(isReverse ? `post_${-direction}` : `post_${direction}`, buf);
    // create event chain among middlewares
    const event = `next_${direction}`;
    const first = middlewares[0];
    if (!first.hasListener(event)) {
      const last = middlewares.reduce((prev, next) => {
        prev.on(event, (buf) => next.write(direction, {buffer: buf, direct}));
        return next;
      });
      // the last middleware send data out via direct(buf, false)
      last.on(event, direct);
    }
    // begin pipe
    first.write(direction, {buffer, direct});
  }

}

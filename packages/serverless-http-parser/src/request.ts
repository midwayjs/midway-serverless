import { is as typeis } from 'type-is';
import * as accepts from 'accepts';
import { FaaSOriginContext } from '@midwayjs/faas-typings/typings/common';

export const request = {
  _accept: null,
  req: null,

  get host(): string {
    return this.get('host');
  },

  /**
   * Parse the "Host" header field hostname
   *
   * @return {String} hostname
   * @api public
   */

  get hostname() {
    const host = this.host;
    if (!host) return '';
    if ('[' === host[0]) return ''; // IPv6 not support
    return host.split(':', 1)[0];
  },

  accepts(...args) {
    return this.accept.types(...args);
  },

  get accept() {
    return this._accept || (this._accept = accepts(this as any));
  },

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array} encoding(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsEncodings(...args) {
    return this.accept.encodings(...args);
  },

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array} charset(s)...
   * @return {String|Array}
   * @api public
   */

  acceptsCharsets(...args) {
    return this.accept.charsets(...args);
  },

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {String|Array} lang(s)...
   * @return {Array|String}
   * @api public
   */

  acceptsLanguages(...args) {
    return this.accept.languages(...args);
  },

  /**
   * faas origin context object
   */
  get getOriginEvent(): FaaSOriginContext {
    return this.req.getOriginEvent();
  },

  get originContext() {
    return this.req.getOriginContext();
  },

  get ip() {
    return this.req.ip;
  },

  get url() {
    return this.req.url;
  },

  get path() {
    return this.req.path;
  },

  get method() {
    return this.req.method;
  },

  get headers() {
    return this.req.headers;
  },

  get header() {
    return this.req.headers;
  },

  get query() {
    return this.req.query;
  },

  get body() {
    return this.req.body;
  },

  get params() {
    return this.req.pathParameters;
  },

  is(type, ...types) {
    return typeis(type, ...types);
  },

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => ''
   *
   * @param {String} field
   * @return {String}
   * @api public
   */

  get(field) {
    switch ((field = field.toLowerCase())) {
      case 'referer':
      case 'referrer':
        return this.headers.referrer || this.headers.referer || '';
      default:
        return this.headers[field] || '';
    }
  },
};

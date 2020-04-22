import { Request } from './request';
import { Response } from './response';
import * as Cookies from 'cookies';

export class Context {
  req;
  request;
  res;
  response;
  statusCode;
  requestId;
  credentials;
  function;
  originContext: null;
  cookies;

  constructor(event, context) {
    this.req = this.request = new Request(event);
    this.res = this.response = new Response();
    this.cookies = new Cookies(this.req, this.res);
    this.requestId = context.requestId;
    this.credentials = context.credentials;
    this.function = context.function;
    this.originContext = context;
  }

  // req delegate
  get headers() {
    return this.req.headers;
  }

  get header() {
    return this.req.header;
  }

  get method() {
    return this.req.method;
  }

  get path() {
    return this.req.path;
  }

  get query() {
    return this.req.query;
  }

  get ip() {
    return this.req.ip;
  }

  get url() {
    return this.req.url;
  }

  get params() {
    return this.req.pathParameters || [];
  }

  get host() {
    return this.req.host;
  }

  get hostname() {
    return this.req.hostname;
  }

  get(field) {
    return this.request.get(field);
  }

  // response delegate
  set type(value) {
    this.res.type = value;
  }

  get type() {
    return this.res.type;
  }

  set body(value) {
    this.res.body = value;
  }

  get body() {
    return this.res.body;
  }

  set status(code) {
    this.res.status = code;
  }

  get status() {
    return this.res.status;
  }

  set(key, value?) {
    this.res.set(key, value)
  }

  set etag(value) {
    this.res.etag = value;
  }

  set lastModified(value) {
    this.res.lastModified = value;
  }

  set length(value) {
    this.res.length = value;
  }

  get length() {
    return this.res.length;
  }

  accepts(type?: string | string[]) {
    return this.request.accepts(type);
  }

  acceptsEncodings(encoding?: string | string[]) {
    return this.request.acceptsEncodings(encoding);
  }

  acceptsCharsets(charset?: string | string[]) {
    return this.request.acceptsCharsets(charset);
  }

  acceptsLanguages(lang?: string | string []) {
    return this.request.acceptsLanguages(lang);
  }

  is(type, ...types) {
    return this.request.is(type, ...types);
  }

}

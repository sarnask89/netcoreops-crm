import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { z } from 'zod';
import { sql, relations as relations$1, eq, or, ilike, and } from 'drizzle-orm';
import { spawn } from 'node:child_process';
import { writeFile as writeFile$1, rm } from 'node:fs/promises';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { Client } from 'ssh2';
import { Socket } from 'node:net';
import { pgTable, timestamp, integer, boolean, uuid, text, varchar, serial, numeric, date, jsonb, doublePrecision, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createHash, timingSafeEqual, createHmac, randomBytes, createCipheriv, scryptSync, createDecipheriv } from 'node:crypto';
import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import Redis from 'ioredis';
import { promises, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { consola } from 'consola';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode$2(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$2(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject$1 = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject$1();
  const opt = {};
  const dec = opt.decode || decode$1;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode$1(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode$1(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode$1(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$2(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$2(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys$1(...keys) {
  return normalizeKey$2(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$2(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$2 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$2,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$2(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$2(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys$1(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$2(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$2(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$2(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$2(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey$1 = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey$1(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function normalizeKey(key, sep = ":") {
  if (!key) {
    return "";
  }
  return key.replace(/[:/\\]/g, sep).replace(/^[:/\\]|[:/\\]$/g, "");
}
function joinKeys(...keys) {
  return keys.map((key) => normalizeKey(key)).filter(Boolean).join(":");
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

const DRIVER_NAME$1 = "redis";
const unstorage_47drivers_47redis = defineDriver((opts) => {
  let redisClient;
  const getRedisClient = () => {
    if (redisClient) {
      return redisClient;
    }
    if (opts.cluster) {
      redisClient = new Redis.Cluster(opts.cluster, opts.clusterOptions);
    } else if (opts.url) {
      redisClient = new Redis(opts.url, opts);
    } else {
      redisClient = new Redis(opts);
    }
    return redisClient;
  };
  const base = (opts.base || "").replace(/:$/, "");
  const p = (...keys) => joinKeys(base, ...keys);
  const d = (key) => base ? key.replace(`${base}:`, "") : key;
  if (opts.preConnect) {
    try {
      getRedisClient();
    } catch (error) {
      console.error(error);
    }
  }
  const scan = async (pattern) => {
    const client = getRedisClient();
    const keys = [];
    let cursor = "0";
    do {
      const [nextCursor, scanKeys] = opts.scanCount ? await client.scan(cursor, "MATCH", pattern, "COUNT", opts.scanCount) : await client.scan(cursor, "MATCH", pattern);
      cursor = nextCursor;
      keys.push(...scanKeys);
    } while (cursor !== "0");
    return keys;
  };
  return {
    name: DRIVER_NAME$1,
    options: opts,
    getInstance: getRedisClient,
    async hasItem(key) {
      return Boolean(await getRedisClient().exists(p(key)));
    },
    async getItem(key) {
      const value = await getRedisClient().get(p(key));
      return value ?? null;
    },
    async getItems(items) {
      const keys = items.map((item) => p(item.key));
      const data = await getRedisClient().mget(...keys);
      return keys.map((key, index) => {
        return {
          key: d(key),
          value: data[index] ?? null
        };
      });
    },
    async setItem(key, value, tOptions) {
      const ttl = tOptions?.ttl ?? opts.ttl;
      if (ttl) {
        await getRedisClient().set(p(key), value, "EX", ttl);
      } else {
        await getRedisClient().set(p(key), value);
      }
    },
    async removeItem(key) {
      await getRedisClient().unlink(p(key));
    },
    async getKeys(base2) {
      const keys = await scan(p(base2, "*"));
      return keys.map((key) => d(key));
    },
    async clear(base2) {
      const keys = await scan(p(base2, "*"));
      if (keys.length === 0) {
        return;
      }
      await getRedisClient().unlink(keys);
    },
    dispose() {
      return getRedisClient().disconnect();
    }
  };
});

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('redis', unstorage_47drivers_47redis({"driver":"redis"}));
storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const defineAppConfig = (config) => config;

const appConfig0 = defineAppConfig({
  ui: {
    colors: {
      primary: "green",
      neutral: "zinc"
    }
  }
});

const inlineAppConfig = {
  "nuxt": {},
  "ui": {
    "colors": {
      "primary": "green",
      "secondary": "blue",
      "success": "green",
      "info": "blue",
      "warning": "yellow",
      "error": "red",
      "neutral": "slate"
    },
    "icons": {
      "arrowDown": "i-lucide-arrow-down",
      "arrowLeft": "i-lucide-arrow-left",
      "arrowRight": "i-lucide-arrow-right",
      "arrowUp": "i-lucide-arrow-up",
      "caution": "i-lucide-circle-alert",
      "check": "i-lucide-check",
      "chevronDoubleLeft": "i-lucide-chevrons-left",
      "chevronDoubleRight": "i-lucide-chevrons-right",
      "chevronDown": "i-lucide-chevron-down",
      "chevronLeft": "i-lucide-chevron-left",
      "chevronRight": "i-lucide-chevron-right",
      "chevronUp": "i-lucide-chevron-up",
      "close": "i-lucide-x",
      "copy": "i-lucide-copy",
      "copyCheck": "i-lucide-copy-check",
      "dark": "i-lucide-moon",
      "drag": "i-lucide-grip-vertical",
      "ellipsis": "i-lucide-ellipsis",
      "error": "i-lucide-circle-x",
      "external": "i-lucide-arrow-up-right",
      "eye": "i-lucide-eye",
      "eyeOff": "i-lucide-eye-off",
      "file": "i-lucide-file",
      "folder": "i-lucide-folder",
      "folderOpen": "i-lucide-folder-open",
      "hash": "i-lucide-hash",
      "info": "i-lucide-info",
      "light": "i-lucide-sun",
      "loading": "i-lucide-loader-circle",
      "menu": "i-lucide-menu",
      "minus": "i-lucide-minus",
      "panelClose": "i-lucide-panel-left-close",
      "panelOpen": "i-lucide-panel-left-open",
      "plus": "i-lucide-plus",
      "reload": "i-lucide-rotate-ccw",
      "search": "i-lucide-search",
      "stop": "i-lucide-square",
      "success": "i-lucide-circle-check",
      "system": "i-lucide-monitor",
      "tip": "i-lucide-lightbulb",
      "upload": "i-lucide-upload",
      "warning": "i-lucide-triangle-alert"
    },
    "tv": {
      "twMergeConfig": {}
    }
  },
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "cssLayer": "base",
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codex",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "cuida",
      "dashicons",
      "devicon",
      "devicon-plain",
      "dinkie-icons",
      "duo-icons",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fa7-brands",
      "fa7-regular",
      "fa7-solid",
      "fad",
      "famicons",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-color",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "garden",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "ix",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "lineicons",
      "logos",
      "ls",
      "lsicon",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-icon-theme",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "meteor-icons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "nrk",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "picon",
      "pixel",
      "pixelarticons",
      "prime",
      "proicons",
      "ps",
      "qlementine-icons",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "roentgen",
      "si",
      "si-glyph",
      "sidekickicons",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "stash",
      "streamline",
      "streamline-block",
      "streamline-color",
      "streamline-cyber",
      "streamline-cyber-color",
      "streamline-emojis",
      "streamline-flex",
      "streamline-flex-color",
      "streamline-freehand",
      "streamline-freehand-color",
      "streamline-kameleon-color",
      "streamline-logos",
      "streamline-pixel",
      "streamline-plump",
      "streamline-plump-color",
      "streamline-sharp",
      "streamline-sharp-color",
      "streamline-stickies-color",
      "streamline-ultimate",
      "streamline-ultimate-color",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "temaki",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};

const appConfig = defuFn(appConfig0, inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "cf39bdf2-0355-47e7-8c61-ecce75d07593",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/api/**": {
        "cors": true,
        "headers": {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
          "access-control-max-age": "0"
        }
      },
      "/api/dashboard/**": {
        "cache": {
          "maxAge": 300
        }
      },
      "/api/system/**": {
        "cache": {
          "maxAge": 3600
        }
      },
      "/api/crm/**": {
        "cache": {
          "maxAge": 120
        }
      },
      "/login": {
        "cache": {
          "maxAge": 3600
        }
      },
      "/settings/**": {
        "cache": {
          "maxAge": 3600
        }
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_fonts/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/login/_payload.json": {
        "ssr": true,
        "cache": {
          "maxAge": 3600
        }
      }
    }
  },
  "public": {},
  "icon": {
    "serverKnownCssClasses": []
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = "\"use strict\";(()=>{const t=window,e=document.documentElement,c=[\"dark\",\"light\"],n=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let i=n===\"system\"?u():n;const r=e.getAttribute(\"data-color-mode-forced\");r&&(i=r),l(i),t[\"__NUXT_COLOR_MODE__\"]={preference:n,value:i,getColorScheme:u,addColorScheme:l,removeColorScheme:d};function l(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.add(s):e.className+=\" \"+s,a&&e.setAttribute(\"data-\"+a,o)}function d(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.remove(s):e.className=e.className.replace(new RegExp(s,\"g\"),\"\"),a&&e.removeAttribute(\"data-\"+a)}function f(o){return t.matchMedia(\"(prefers-color-scheme\"+o+\")\")}function u(){if(t.matchMedia&&f(\"\").media!==\"not all\"){for(const o of c)if(f(\":\"+o).matches)return o}return\"light\"}})();function getStorageValue(t,e){switch(t){case\"localStorage\":return window.localStorage.getItem(e);case\"sessionStorage\":return window.sessionStorage.getItem(e);case\"cookie\":return getCookie(e);default:return null}}function getCookie(t){const c=(\"; \"+window.document.cookie).split(\"; \"+t+\"=\");if(c.length===2)return c.pop()?.split(\";\").shift()}";

const _IbZPtUtA5TFZto84m6p_UgscGVEBw6gfA_K9eUx8Nog = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const plugins = [
  _IbZPtUtA5TFZto84m6p_UgscGVEBw6gfA_K9eUx8Nog
];

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2026-05-24T05:56:55.470Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-W25bL8NF1fjpLRSOgJb7RoZPHqGQNwMTM7S9tHVoxx8.woff2": {
    "type": "font/woff2",
    "etag": "\"6ec4-8OoFFPZKF1grqmfGVjh5JDE6DOU\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 28356,
    "path": "../public/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-W25bL8NF1fjpLRSOgJb7RoZPHqGQNwMTM7S9tHVoxx8.woff2"
  },
  "/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-jHA4tBeM1bjF7LATGUpfBuSTyomIFrWBTzjF7txVYfg.woff2": {
    "type": "font/woff2",
    "etag": "\"680c-mJtsV33lkTAKSmfq5k3lKHSllcU\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 26636,
    "path": "../public/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-jHA4tBeM1bjF7LATGUpfBuSTyomIFrWBTzjF7txVYfg.woff2"
  },
  "/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-zJfbBtpgM4cDmcXBsqZNW79_kFnlpPd62b48glgdydA.woff2": {
    "type": "font/woff2",
    "etag": "\"4b5c-TAo9mx7r3xQs52+HbHcHJ52z8Qo\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 19292,
    "path": "../public/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-zJfbBtpgM4cDmcXBsqZNW79_kFnlpPd62b48glgdydA.woff2"
  },
  "/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-x2gYI4qfmkRdxyQQUPaBZdZdgl1TeVrquF_TxHeM4lM.woff2": {
    "type": "font/woff2",
    "etag": "\"212c-FshXJibFzNhd2HEIMP8C3JR5PYg\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 8492,
    "path": "../public/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-x2gYI4qfmkRdxyQQUPaBZdZdgl1TeVrquF_TxHeM4lM.woff2"
  },
  "/_nuxt/2N1v48TW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1264-gvFW9+eswNjQ2Gz/6GQZzx/N1OE\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 4708,
    "path": "../public/_nuxt/2N1v48TW.js.br"
  },
  "/_nuxt/2N1v48TW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"147a-3UWgACqo1EQcDLYR3kO/LlOygiE\"",
    "mtime": "2026-05-24T05:56:55.675Z",
    "size": 5242,
    "path": "../public/_nuxt/2N1v48TW.js.gz"
  },
  "/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-AndUyau2HR2felA_ra8V2mutQgschhasE5FD1dXGJX8.woff2": {
    "type": "font/woff2",
    "etag": "\"47c4-5xyngHnzzhetUee74tMx9OTgqNQ\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 18372,
    "path": "../public/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-AndUyau2HR2felA_ra8V2mutQgschhasE5FD1dXGJX8.woff2"
  },
  "/_nuxt/379EalJk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a8-YqIB+2WklcLZ0ZHzB1PPoKtGOKs\"",
    "mtime": "2026-05-24T05:56:55.675Z",
    "size": 1192,
    "path": "../public/_nuxt/379EalJk.js.br"
  },
  "/_nuxt/379EalJk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"51c-jZTMJiozvnwc8Vhc2A73U0S37/Q\"",
    "mtime": "2026-05-24T05:56:55.491Z",
    "size": 1308,
    "path": "../public/_nuxt/379EalJk.js.gz"
  },
  "/_nuxt/4Y1S2qyh.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"205f-nKmAVpDbchyXIRduX+MpelW8/YY\"",
    "mtime": "2026-05-24T05:56:55.314Z",
    "size": 8287,
    "path": "../public/_nuxt/4Y1S2qyh.js"
  },
  "/_nuxt/4Y1S2qyh.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8f6-cYTvXupu0Nt6WjIvCV4ZKabXKRc\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 2294,
    "path": "../public/_nuxt/4Y1S2qyh.js.br"
  },
  "/_nuxt/4Y1S2qyh.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a1a-mHIqiEfcA1rkMC9RKvhxD7ro1mY\"",
    "mtime": "2026-05-24T05:56:55.491Z",
    "size": 2586,
    "path": "../public/_nuxt/4Y1S2qyh.js.gz"
  },
  "/_nuxt/379EalJk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ad4-BDu+/TkaGHfwX7whYEbzgKA6yvM\"",
    "mtime": "2026-05-24T05:56:55.434Z",
    "size": 2772,
    "path": "../public/_nuxt/379EalJk.js"
  },
  "/_nuxt/6rccYh31.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"68ed-zoTXmgJ8OUt3LXJcKw995IjKuVE\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 26861,
    "path": "../public/_nuxt/6rccYh31.js.br"
  },
  "/_nuxt/6rccYh31.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7cbd-gI7oi4K8AGh5W7k44edO3FaiJ+w\"",
    "mtime": "2026-05-24T05:56:55.683Z",
    "size": 31933,
    "path": "../public/_nuxt/6rccYh31.js.gz"
  },
  "/_nuxt/2N1v48TW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4b25-/pZUBY6pWMonejsGXR7n/sUgltY\"",
    "mtime": "2026-05-24T05:56:55.434Z",
    "size": 19237,
    "path": "../public/_nuxt/2N1v48TW.js"
  },
  "/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-KhwZiS86o3fErOe5GGMExHUemmI_dBfaEFxjISZrBd0.woff2": {
    "type": "font/woff2",
    "etag": "\"1d98-cDZfMibtk4T04FTTAmlfhWDpkN0\"",
    "mtime": "2026-05-24T05:56:55.258Z",
    "size": 7576,
    "path": "../public/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-KhwZiS86o3fErOe5GGMExHUemmI_dBfaEFxjISZrBd0.woff2"
  },
  "/_nuxt/AgYq73EN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"73af-WCQqQbz9YjDJH5frK5HTiG3wul8\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 29615,
    "path": "../public/_nuxt/AgYq73EN.js.br"
  },
  "/_nuxt/AgYq73EN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8606-7b4a0WePojr6vMF5SGDB94Swl9M\"",
    "mtime": "2026-05-24T05:56:55.815Z",
    "size": 34310,
    "path": "../public/_nuxt/AgYq73EN.js.gz"
  },
  "/_nuxt/71q6vAlM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"177-ZZnRV7er3pxut8ulexUcm1gHaP0\"",
    "mtime": "2026-05-24T05:56:55.314Z",
    "size": 375,
    "path": "../public/_nuxt/71q6vAlM.js"
  },
  "/_nuxt/B0LkMSmR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"302-m5chNyHSsOvdk0EPXHHEz6bUX4s\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 770,
    "path": "../public/_nuxt/B0LkMSmR.js.br"
  },
  "/_nuxt/B0LkMSmR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"61e-587U5PR5rt5Ud1QCYgc8eyUKNtI\"",
    "mtime": "2026-05-24T05:56:55.434Z",
    "size": 1566,
    "path": "../public/_nuxt/B0LkMSmR.js"
  },
  "/_nuxt/AgYq73EN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ac80-+QUYhNIDPF/iEGz+JoF/w3Z0qWo\"",
    "mtime": "2026-05-24T05:56:55.318Z",
    "size": 109696,
    "path": "../public/_nuxt/AgYq73EN.js"
  },
  "/_nuxt/6rccYh31.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"20605-cBlxyDetNwZl/r8NV7Q+381C4UY\"",
    "mtime": "2026-05-24T05:56:55.434Z",
    "size": 132613,
    "path": "../public/_nuxt/6rccYh31.js"
  },
  "/_nuxt/B0LkMSmR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"368-ky4QotWqs5UR19i2R9vqr+MX9Uw\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 872,
    "path": "../public/_nuxt/B0LkMSmR.js.gz"
  },
  "/_nuxt/BAnZGdZF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"730-D2Q/UcFLeD/TAMYHwfSuyIippbw\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 1840,
    "path": "../public/_nuxt/BAnZGdZF.js.br"
  },
  "/_nuxt/BAnZGdZF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7f5-dTnKa7xyd1cRcDMzNlWwqbiZj/0\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 2037,
    "path": "../public/_nuxt/BAnZGdZF.js.gz"
  },
  "/_nuxt/BDO05EOF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8af-7P8jDTfeHDm79uuKnCc+7/XZsFk\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 2223,
    "path": "../public/_nuxt/BDO05EOF.js.br"
  },
  "/_nuxt/BAnZGdZF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"151d-3kAz6VfLAEgWTR5ppBSMuqATv0o\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 5405,
    "path": "../public/_nuxt/BAnZGdZF.js"
  },
  "/_nuxt/BDO05EOF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a2e-Hf2fD7/u2vc+zjzGpGsEgnwFkh8\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 2606,
    "path": "../public/_nuxt/BDO05EOF.js.gz"
  },
  "/_nuxt/BE3BfnA0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d1b-OVu1lnDJlhHm+6pm3UpBZL8c0iw\"",
    "mtime": "2026-05-24T05:56:55.827Z",
    "size": 3355,
    "path": "../public/_nuxt/BE3BfnA0.js.br"
  },
  "/_nuxt/BE3BfnA0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e8b-7hxCwVEE7+uHnNFx47+VTUkYAKA\"",
    "mtime": "2026-05-24T05:56:55.679Z",
    "size": 3723,
    "path": "../public/_nuxt/BE3BfnA0.js.gz"
  },
  "/_nuxt/BEcVQLYy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c31-eqkGP90rkab1xTkKlk/WEluqBfk\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 3121,
    "path": "../public/_nuxt/BEcVQLYy.js.br"
  },
  "/_nuxt/BEcVQLYy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d94-TLpr46IOLUQDVoOwRR/TTUoaijc\"",
    "mtime": "2026-05-24T05:56:55.827Z",
    "size": 3476,
    "path": "../public/_nuxt/BEcVQLYy.js.gz"
  },
  "/_nuxt/BE3BfnA0.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"35df-QeNpCspie6pT6BQeibJhzOuAf8s\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 13791,
    "path": "../public/_nuxt/BE3BfnA0.js"
  },
  "/_nuxt/BG2YH96g.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"55a-0EUr9wxX43dA/0t8A7PhsCpiEH0\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 1370,
    "path": "../public/_nuxt/BG2YH96g.js.br"
  },
  "/_nuxt/BG2YH96g.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"611-jUr4aIpVFwFR31ITq+jvg5+jiug\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 1553,
    "path": "../public/_nuxt/BG2YH96g.js.gz"
  },
  "/_nuxt/BG2YH96g.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"15ec-XronBF9CcFaymSswnzbWw2kaMVI\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 5612,
    "path": "../public/_nuxt/BG2YH96g.js"
  },
  "/_nuxt/BHHNytkL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d0-3bqM+sFRO6G5XrZERMQCFRc2tHw\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 720,
    "path": "../public/_nuxt/BHHNytkL.js.br"
  },
  "/_nuxt/BHHNytkL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"323-o1zBvecY39xTqykE1GG1DCfEQsQ\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 803,
    "path": "../public/_nuxt/BHHNytkL.js.gz"
  },
  "/_nuxt/BEcVQLYy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"26bd-3y6wmNdqhSYNmQWBqND66gM0fv0\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 9917,
    "path": "../public/_nuxt/BEcVQLYy.js"
  },
  "/_nuxt/BDO05EOF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1351-k3iPoDtR/Uf7BLlG8RLYbYgWOKI\"",
    "mtime": "2026-05-24T05:56:55.434Z",
    "size": 4945,
    "path": "../public/_nuxt/BDO05EOF.js"
  },
  "/_nuxt/BZ9hHHcD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"16fb-lf3xoeFNGtxlb63jtncsE5VnCfA\"",
    "mtime": "2026-05-24T05:56:56.383Z",
    "size": 5883,
    "path": "../public/_nuxt/BZ9hHHcD.js.br"
  },
  "/_nuxt/BZ9hHHcD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"199d-8jwhIKMujLWJKt/5g14HLdKBTVQ\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 6557,
    "path": "../public/_nuxt/BZ9hHHcD.js.gz"
  },
  "/_nuxt/BScij3CO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c6-cH+xhIuWisb0bNV/OHBuNbrVsmo\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 198,
    "path": "../public/_nuxt/BScij3CO.js"
  },
  "/_nuxt/BZ9hHHcD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6510-JnweAAqXlmokUAVQuBrKd3DGWlU\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 25872,
    "path": "../public/_nuxt/BZ9hHHcD.js"
  },
  "/_nuxt/Bee1orf1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"82-yd3jxMJAE0FnoGW2+c8MZLPKLwU\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 130,
    "path": "../public/_nuxt/Bee1orf1.js"
  },
  "/_nuxt/BHHNytkL.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"567-cfCktFVm7ra4gRFX2QkbNpU46b4\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 1383,
    "path": "../public/_nuxt/BHHNytkL.js"
  },
  "/_nuxt/Bj6Kqgf_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ac4-E17FoqNtqrffO+aMBdHExo9NGYw\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 6852,
    "path": "../public/_nuxt/Bj6Kqgf_.js"
  },
  "/_nuxt/Bj6Kqgf_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"772-0nQCFlM76fwWffFU1JU3tl7TKgo\"",
    "mtime": "2026-05-24T05:56:56.135Z",
    "size": 1906,
    "path": "../public/_nuxt/Bj6Kqgf_.js.br"
  },
  "/_nuxt/Bj6Kqgf_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"854-GlzlihpTgyLNTKBWjj21C8gz8NQ\"",
    "mtime": "2026-05-24T05:56:56.131Z",
    "size": 2132,
    "path": "../public/_nuxt/Bj6Kqgf_.js.gz"
  },
  "/_nuxt/Bv_0Hj2i.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e00-A4UVmGLM2tUTRJwpwBUiZxoeufc\"",
    "mtime": "2026-05-24T05:56:56.371Z",
    "size": 3584,
    "path": "../public/_nuxt/Bv_0Hj2i.js.br"
  },
  "/_nuxt/Bv_0Hj2i.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f91-sY9L2gTwnA8JR1SuxNjM8eQwKD4\"",
    "mtime": "2026-05-24T05:56:56.371Z",
    "size": 3985,
    "path": "../public/_nuxt/Bv_0Hj2i.js.gz"
  },
  "/_nuxt/Bv_0Hj2i.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2ab9-FTXl68/0hHNbMc0W+k21jVxkUqY\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 10937,
    "path": "../public/_nuxt/Bv_0Hj2i.js"
  },
  "/_nuxt/BwYmDPA_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"91c-g1q+an2XJeS41NZ3r/0O16qWwng\"",
    "mtime": "2026-05-24T05:56:56.371Z",
    "size": 2332,
    "path": "../public/_nuxt/BwYmDPA_.js.br"
  },
  "/_nuxt/BwYmDPA_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a22-eJ3P7CRPZkse5zlQ7RxHHA7x880\"",
    "mtime": "2026-05-24T05:56:56.371Z",
    "size": 2594,
    "path": "../public/_nuxt/BwYmDPA_.js.gz"
  },
  "/_nuxt/BwYmDPA_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1d10-JaL3WjcrjR3w4zSXWT2kRe/u8cM\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 7440,
    "path": "../public/_nuxt/BwYmDPA_.js"
  },
  "/_nuxt/C0a0khqd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"886-tHWuwL025Up5E5U72Zauywlo4iM\"",
    "mtime": "2026-05-24T05:56:57.555Z",
    "size": 2182,
    "path": "../public/_nuxt/C0a0khqd.js.br"
  },
  "/_nuxt/C0a0khqd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"96d-WavSFFfORQCWR2MnKOGAnYZeLQA\"",
    "mtime": "2026-05-24T05:56:56.383Z",
    "size": 2413,
    "path": "../public/_nuxt/C0a0khqd.js.gz"
  },
  "/_nuxt/C0a0khqd.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1c3b-AFrCRfnZUD0BnOr7Kyb7+bWBEz8\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 7227,
    "path": "../public/_nuxt/C0a0khqd.js"
  },
  "/_nuxt/C2DiXWkr.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3147-aKrxiv28KtrVarMDkDzDHBQ257E\"",
    "mtime": "2026-05-24T05:56:57.555Z",
    "size": 12615,
    "path": "../public/_nuxt/C2DiXWkr.js.br"
  },
  "/_nuxt/C2DiXWkr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3693-GmWAeVHpV7Ywt1pbdIxt7ifl3nc\"",
    "mtime": "2026-05-24T05:56:57.555Z",
    "size": 13971,
    "path": "../public/_nuxt/C2DiXWkr.js.gz"
  },
  "/_nuxt/C2DiXWkr.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"91de-Cyam36LZUuh++fZRMVHTdpAjHI8\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 37342,
    "path": "../public/_nuxt/C2DiXWkr.js"
  },
  "/_nuxt/C81aMt8n.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1cd89-Oy7UwVGz9IlbnIU/nD8KB1j614Y\"",
    "mtime": "2026-05-24T05:57:04.255Z",
    "size": 118153,
    "path": "../public/_nuxt/C81aMt8n.js.br"
  },
  "/_nuxt/C81aMt8n.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"21960-z0wq/CETV6ybPMYZfekKOhI7xus\"",
    "mtime": "2026-05-24T05:56:57.863Z",
    "size": 137568,
    "path": "../public/_nuxt/C81aMt8n.js.gz"
  },
  "/_nuxt/C0tCKUx7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3af-H+PJcC/G/tfJHPs4jJk9E9TJSxU\"",
    "mtime": "2026-05-24T05:56:55.438Z",
    "size": 943,
    "path": "../public/_nuxt/C0tCKUx7.js"
  },
  "/_nuxt/CCk13XN4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"13a2-EeS+pqpi6c1eIk2yYR0L9vqN1xY\"",
    "mtime": "2026-05-24T05:56:57.555Z",
    "size": 5026,
    "path": "../public/_nuxt/CCk13XN4.js.br"
  },
  "/_nuxt/CCk13XN4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1608-KlZoO++ktweTQZAMS0AdPLYdjq8\"",
    "mtime": "2026-05-24T05:56:57.555Z",
    "size": 5640,
    "path": "../public/_nuxt/CCk13XN4.js.gz"
  },
  "/_nuxt/CDw-XNRP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"712-P0djDkqpsFrQHBWnCgOCpzGRDTU\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 1810,
    "path": "../public/_nuxt/CDw-XNRP.js"
  },
  "/_nuxt/CDw-XNRP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"36c-oa7i7PgmdAFTqDBAglGr6jxKJg0\"",
    "mtime": "2026-05-24T05:56:57.811Z",
    "size": 876,
    "path": "../public/_nuxt/CDw-XNRP.js.br"
  },
  "/_nuxt/CDw-XNRP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3c6-Ynczj80kUhPzjkjAw0iMoMr7AsI\"",
    "mtime": "2026-05-24T05:56:57.811Z",
    "size": 966,
    "path": "../public/_nuxt/CDw-XNRP.js.gz"
  },
  "/_nuxt/CCk13XN4.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4cdf-c8PEkFfD4eb2O1vlnwNitwXgsrE\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 19679,
    "path": "../public/_nuxt/CCk13XN4.js"
  },
  "/_nuxt/C81aMt8n.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"61372-a1FZt3O6cCVaFNm4NCVynm6ZDhE\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 398194,
    "path": "../public/_nuxt/C81aMt8n.js"
  },
  "/_nuxt/CF0z1mk6.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"34c2-2YNkSw6FLTnJY9+PPm5jOo7e6oM\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 13506,
    "path": "../public/_nuxt/CF0z1mk6.js"
  },
  "/_nuxt/CF0z1mk6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"d52-HfxlFpFbhlCPPlww7cpaw8aQcmE\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 3410,
    "path": "../public/_nuxt/CF0z1mk6.js.br"
  },
  "/_nuxt/CF0z1mk6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ef9-/v1dXTO69wmmg8uz6haDBgB+Y5g\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 3833,
    "path": "../public/_nuxt/CF0z1mk6.js.gz"
  },
  "/_nuxt/CIY4p3JP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"97b-a8xAiSgjn96aacib3xY8JAQxb4A\"",
    "mtime": "2026-05-24T05:56:57.867Z",
    "size": 2427,
    "path": "../public/_nuxt/CIY4p3JP.js.br"
  },
  "/_nuxt/CIY4p3JP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a87-GgadHAND0LL6Aon8SQ/FL08slnw\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 2695,
    "path": "../public/_nuxt/CIY4p3JP.js.gz"
  },
  "/_nuxt/CRZptQIy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"73f-j1B8HNKaO9V5MTYdfHPJ9uc4UvU\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 1855,
    "path": "../public/_nuxt/CRZptQIy.js.br"
  },
  "/_nuxt/CRZptQIy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"808-mgmvuJNcSw6Ke4bNzylCf88+N0I\"",
    "mtime": "2026-05-24T05:56:57.827Z",
    "size": 2056,
    "path": "../public/_nuxt/CRZptQIy.js.gz"
  },
  "/_nuxt/CRufvBCF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d1-P6c2AruXqRxnJNF0j7h/1aROBpM\"",
    "mtime": "2026-05-24T05:56:57.935Z",
    "size": 721,
    "path": "../public/_nuxt/CRufvBCF.js.br"
  },
  "/_nuxt/CRufvBCF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"343-1DcoT6WeSfJuYL/OTcjbGw7Pyeo\"",
    "mtime": "2026-05-24T05:56:57.863Z",
    "size": 835,
    "path": "../public/_nuxt/CRufvBCF.js.gz"
  },
  "/_nuxt/CRZptQIy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"16b1-3yYLjLS8L/6+9mp1ZaFFoQ1ZZrk\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 5809,
    "path": "../public/_nuxt/CRZptQIy.js"
  },
  "/_nuxt/CSMukUkv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"83c-nJGi55pOfztB44e/6rCZkU/SeOM\"",
    "mtime": "2026-05-24T05:56:57.959Z",
    "size": 2108,
    "path": "../public/_nuxt/CSMukUkv.js.br"
  },
  "/_nuxt/CSMukUkv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"92e-eM0Y0C8vyWSWojS5Z+Bio3/SyuY\"",
    "mtime": "2026-05-24T05:56:57.867Z",
    "size": 2350,
    "path": "../public/_nuxt/CSMukUkv.js.gz"
  },
  "/_nuxt/CSMukUkv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"18be-e/D/D1FuYEmSzGaXLfTzJ5IX5GQ\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 6334,
    "path": "../public/_nuxt/CSMukUkv.js"
  },
  "/_nuxt/CWaS672i.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5db-SYi5xokeJQyZdkbI65LWlYQLQjQ\"",
    "mtime": "2026-05-24T05:56:57.959Z",
    "size": 1499,
    "path": "../public/_nuxt/CWaS672i.js.br"
  },
  "/_nuxt/CWaS672i.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"68e-DOEIBgUkDHXwDkN9e3lTYXy/UrQ\"",
    "mtime": "2026-05-24T05:56:57.867Z",
    "size": 1678,
    "path": "../public/_nuxt/CWaS672i.js.gz"
  },
  "/_nuxt/CIY4p3JP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1df0-FXpKMI8sMfI3ZrmGGDU5qMvDjhw\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 7664,
    "path": "../public/_nuxt/CIY4p3JP.js"
  },
  "/_nuxt/CYPmq43L.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"44f-Jj/wxZ234U8xDtv5TsxHVGr5jy0\"",
    "mtime": "2026-05-24T05:56:58.095Z",
    "size": 1103,
    "path": "../public/_nuxt/CYPmq43L.js.br"
  },
  "/_nuxt/CYPmq43L.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4e2-3YxX/v/CeU4+h1kE0kzcF1Bz1GE\"",
    "mtime": "2026-05-24T05:56:57.959Z",
    "size": 1250,
    "path": "../public/_nuxt/CYPmq43L.js.gz"
  },
  "/_nuxt/CRufvBCF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"684-kD0dGsbUcNspxIxdeFr5G/jxqSs\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 1668,
    "path": "../public/_nuxt/CRufvBCF.js"
  },
  "/_nuxt/Cb94AIWd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4158-8kYFhmgmA14OCyGx4xRx79ZYw00\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 16728,
    "path": "../public/_nuxt/Cb94AIWd.js.br"
  },
  "/_nuxt/CWaS672i.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"103e-xsgFE1XVPIKMQHC6063qqlZBPrU\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 4158,
    "path": "../public/_nuxt/CWaS672i.js"
  },
  "/_nuxt/Cb94AIWd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4877-Ez3fdv4saHPOhD3SOtUuEzbiJrY\"",
    "mtime": "2026-05-24T05:56:58.099Z",
    "size": 18551,
    "path": "../public/_nuxt/Cb94AIWd.js.gz"
  },
  "/_nuxt/Cb94AIWd.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"10d40-Eoicyo5q5IB+170jzUGJRTmNG3I\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 68928,
    "path": "../public/_nuxt/Cb94AIWd.js"
  },
  "/_nuxt/CYPmq43L.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9a3-Kr3v1F5mUlAcyDv9ESLgE2Or23c\"",
    "mtime": "2026-05-24T05:56:55.442Z",
    "size": 2467,
    "path": "../public/_nuxt/CYPmq43L.js"
  },
  "/_nuxt/CfdF2QgQ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"887-bQPYSd2YUWzWxgqAp7HQnE4l5ps\"",
    "mtime": "2026-05-24T05:56:58.095Z",
    "size": 2183,
    "path": "../public/_nuxt/CfdF2QgQ.js.br"
  },
  "/_nuxt/CfdF2QgQ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1c30-rx54PpXoQqsVU9IsKlqmTRegvEg\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 7216,
    "path": "../public/_nuxt/CfdF2QgQ.js"
  },
  "/_nuxt/CfdF2QgQ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"95c-CWLFLu9CeT5F+LXzvneW70deY6g\"",
    "mtime": "2026-05-24T05:56:58.095Z",
    "size": 2396,
    "path": "../public/_nuxt/CfdF2QgQ.js.gz"
  },
  "/_nuxt/ChnMDjk5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"881-gn9K1U5sSzIkzsrDos5wBdctnH0\"",
    "mtime": "2026-05-24T05:56:58.151Z",
    "size": 2177,
    "path": "../public/_nuxt/ChnMDjk5.js.br"
  },
  "/_nuxt/ChnMDjk5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"976-iEnk2PAfIoqf/cy1e6gKUHxUyRc\"",
    "mtime": "2026-05-24T05:56:58.095Z",
    "size": 2422,
    "path": "../public/_nuxt/ChnMDjk5.js.gz"
  },
  "/_nuxt/CmGvA0Kb.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"41c-Gr94ChmFfoOl3h6FgZ829MNVvLc\"",
    "mtime": "2026-05-24T05:56:58.099Z",
    "size": 1052,
    "path": "../public/_nuxt/CmGvA0Kb.js.br"
  },
  "/_nuxt/CmGvA0Kb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"494-g64GMqxq0LfQykGkpStIzedgG3s\"",
    "mtime": "2026-05-24T05:56:58.099Z",
    "size": 1172,
    "path": "../public/_nuxt/CmGvA0Kb.js.gz"
  },
  "/_nuxt/CoOLOlvN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"548-OQNtgSP/afIPL9WB9Vm4LdBDBxQ\"",
    "mtime": "2026-05-24T05:56:58.263Z",
    "size": 1352,
    "path": "../public/_nuxt/CoOLOlvN.js.br"
  },
  "/_nuxt/CoOLOlvN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5cb-RYEcDjnQO/k5+S1Q/mF6jmSqyus\"",
    "mtime": "2026-05-24T05:56:58.151Z",
    "size": 1483,
    "path": "../public/_nuxt/CoOLOlvN.js.gz"
  },
  "/_nuxt/CpyPM2zT.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1b07-D8V47Nr6724q7uvSa/h8g77mXtQ\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 6919,
    "path": "../public/_nuxt/CpyPM2zT.js"
  },
  "/_nuxt/CpyPM2zT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a18-vi1cjSssw8woq3YewgB15lc9WSE\"",
    "mtime": "2026-05-24T05:56:58.271Z",
    "size": 2584,
    "path": "../public/_nuxt/CpyPM2zT.js.br"
  },
  "/_nuxt/CpyPM2zT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b3d-1ag7z/rC/ghG8fxrOvC/rgt/WMI\"",
    "mtime": "2026-05-24T05:56:58.263Z",
    "size": 2877,
    "path": "../public/_nuxt/CpyPM2zT.js.gz"
  },
  "/_nuxt/CmGvA0Kb.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"8d7-AbF5lM7Qw+mw51v8ahoC4TOnOoc\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 2263,
    "path": "../public/_nuxt/CmGvA0Kb.js"
  },
  "/_nuxt/CwBEKSUC.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5fbf-yqd20OTEmKN601UrcqkZ8HNXKBU\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 24511,
    "path": "../public/_nuxt/CwBEKSUC.js"
  },
  "/_nuxt/CoOLOlvN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cd2-AWJg+zEOKg0lFCQd5eNudnCOXNQ\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 3282,
    "path": "../public/_nuxt/CoOLOlvN.js"
  },
  "/_nuxt/ChnMDjk5.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1afa-ZP7agVPvI7yw5HGC6FO/n1FC/0o\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 6906,
    "path": "../public/_nuxt/ChnMDjk5.js"
  },
  "/_nuxt/CwBEKSUC.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"19f0-7Q+BAZCs7Z2DBXYHYCQrHszmdOk\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 6640,
    "path": "../public/_nuxt/CwBEKSUC.js.br"
  },
  "/_nuxt/CwBEKSUC.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1cf3-NDt+/e+RMn/6n16+8ThL+VdpWrc\"",
    "mtime": "2026-05-24T05:56:58.271Z",
    "size": 7411,
    "path": "../public/_nuxt/CwBEKSUC.js.gz"
  },
  "/_nuxt/Cyi7ZIAD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1025-LeeG0SHNRn/0VmgcgMXRSwCe3yA\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 4133,
    "path": "../public/_nuxt/Cyi7ZIAD.js"
  },
  "/_nuxt/Cyi7ZIAD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5dd-pgIKwYe+YufhToFhl8jvRTgbgHU\"",
    "mtime": "2026-05-24T05:56:58.279Z",
    "size": 1501,
    "path": "../public/_nuxt/Cyi7ZIAD.js.br"
  },
  "/_nuxt/Cyi7ZIAD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"683-14BwtDoPjM0O6U8mrFC3RJRw6hs\"",
    "mtime": "2026-05-24T05:56:58.271Z",
    "size": 1667,
    "path": "../public/_nuxt/Cyi7ZIAD.js.gz"
  },
  "/_nuxt/D0pdsOJP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"913-bPEcpdvMDXhj9oJjOnr1q2LLA8Q\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 2323,
    "path": "../public/_nuxt/D0pdsOJP.js.br"
  },
  "/_nuxt/D0pdsOJP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a17-drpe0FHn1w/O2o20nP/ZQcD4hnI\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 2583,
    "path": "../public/_nuxt/D0pdsOJP.js.gz"
  },
  "/_nuxt/D2Zs8oxN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"27bd-Mb4laxCe+Pmq8SKYt1q0u2T0Kvo\"",
    "mtime": "2026-05-24T05:56:58.787Z",
    "size": 10173,
    "path": "../public/_nuxt/D2Zs8oxN.js.br"
  },
  "/_nuxt/D2Zs8oxN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9a57-+sugfNQgPlTu1V5QU2/WLoRIJ5w\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 39511,
    "path": "../public/_nuxt/D2Zs8oxN.js"
  },
  "/_nuxt/D0pdsOJP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1cf9-+gcorp4d8qwKKdB014hdGOfSHaE\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 7417,
    "path": "../public/_nuxt/D0pdsOJP.js"
  },
  "/_nuxt/D2Zs8oxN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2c54-7RGSuQtpUFrSnav0sbV4n9TpBDk\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 11348,
    "path": "../public/_nuxt/D2Zs8oxN.js.gz"
  },
  "/_nuxt/D2_NWsCR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"13bc-fQCWoksD6wmWkKXUcC221DgOVwI\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 5052,
    "path": "../public/_nuxt/D2_NWsCR.js.br"
  },
  "/_nuxt/D2_NWsCR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"15ea-JdvVyLhDfhTnk+LpnjvA6QpSmDA\"",
    "mtime": "2026-05-24T05:56:58.647Z",
    "size": 5610,
    "path": "../public/_nuxt/D2_NWsCR.js.gz"
  },
  "/_nuxt/D4BwRLsK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"92a-jY63bzBnEAa2F9xKe4fLjs/Gw50\"",
    "mtime": "2026-05-24T05:56:58.727Z",
    "size": 2346,
    "path": "../public/_nuxt/D4BwRLsK.js.br"
  },
  "/_nuxt/D4BwRLsK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a56-Yr3UIz1QK3ato9UqTNZlSG9p3lw\"",
    "mtime": "2026-05-24T05:56:58.727Z",
    "size": 2646,
    "path": "../public/_nuxt/D4BwRLsK.js.gz"
  },
  "/_nuxt/D6-dl3ws.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"17cf-ooHKktGdr+8mUW/7zoAJiz0PvB8\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 6095,
    "path": "../public/_nuxt/D6-dl3ws.js"
  },
  "/_nuxt/D6-dl3ws.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5de-3qgdbBGFyE0PhVfEHaKCLc//9yY\"",
    "mtime": "2026-05-24T05:56:58.791Z",
    "size": 1502,
    "path": "../public/_nuxt/D6-dl3ws.js.br"
  },
  "/_nuxt/D6-dl3ws.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6b1-5skZE+BIbjOFWbx1wjP8wdZKLXk\"",
    "mtime": "2026-05-24T05:56:58.787Z",
    "size": 1713,
    "path": "../public/_nuxt/D6-dl3ws.js.gz"
  },
  "/_nuxt/D4BwRLsK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2308-KKeFFh3Bw6cqHZQCjLIR9mzl4Bs\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 8968,
    "path": "../public/_nuxt/D4BwRLsK.js"
  },
  "/_nuxt/D4k11_F0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1-HZnY3q6dPZouTgQpXm8JowVUA10\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 209,
    "path": "../public/_nuxt/D4k11_F0.js"
  },
  "/_nuxt/D2_NWsCR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3f44-n6q4ejlYtt6mfdJr3MY/1GEswAI\"",
    "mtime": "2026-05-24T05:56:55.446Z",
    "size": 16196,
    "path": "../public/_nuxt/D2_NWsCR.js"
  },
  "/_nuxt/DJ2Z-Lmi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"fef-97A3b6qbGdlu7TjP2YC3kuYv400\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 4079,
    "path": "../public/_nuxt/DJ2Z-Lmi.js"
  },
  "/_nuxt/DJ2Z-Lmi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"56c-96R+WLp92Zq5Mg0XKpTtwBJQHoI\"",
    "mtime": "2026-05-24T05:56:58.787Z",
    "size": 1388,
    "path": "../public/_nuxt/DJ2Z-Lmi.js.br"
  },
  "/_nuxt/DJ2Z-Lmi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"609-1LvldG4Ieb3kSeBXn7JdB0uWcR0\"",
    "mtime": "2026-05-24T05:56:58.787Z",
    "size": 1545,
    "path": "../public/_nuxt/DJ2Z-Lmi.js.gz"
  },
  "/_nuxt/DJg1kCqg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"125d-d8jFVc7doWyZjbNk7joJQ+8oZPg\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 4701,
    "path": "../public/_nuxt/DJg1kCqg.js.br"
  },
  "/_nuxt/DJg1kCqg.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4040-YikOTmIEx2fTEXK4hxYVQztPEgs\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 16448,
    "path": "../public/_nuxt/DJg1kCqg.js"
  },
  "/_nuxt/DJg1kCqg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"142c-PNuaYlOslRlM60hJY4C7Q57nl3s\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 5164,
    "path": "../public/_nuxt/DJg1kCqg.js.gz"
  },
  "/_nuxt/DLfiLDnN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a6f-N0MVuLzuPdw3rNHVjOD5Q3EIF0M\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 6767,
    "path": "../public/_nuxt/DLfiLDnN.js"
  },
  "/_nuxt/DLfiLDnN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8cc-u2M0Vvn/8Ltf5ZX4r4aj7s8L1lg\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 2252,
    "path": "../public/_nuxt/DLfiLDnN.js.br"
  },
  "/_nuxt/DLfiLDnN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9d2-Msfhx6xU22ybbOBrVv66jUBOGAI\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 2514,
    "path": "../public/_nuxt/DLfiLDnN.js.gz"
  },
  "/_nuxt/DNwp4oih.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ed1-Um+Rd3riAPjzfKdJYv4KlPCOOqo\"",
    "mtime": "2026-05-24T05:56:58.943Z",
    "size": 3793,
    "path": "../public/_nuxt/DNwp4oih.js.br"
  },
  "/_nuxt/DNwp4oih.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"10a5-J2hZXyJhi54fuDqpFlKMLe40LSw\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 4261,
    "path": "../public/_nuxt/DNwp4oih.js.gz"
  },
  "/_nuxt/DNwp4oih.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"39ad-8XtZMvOsesUWs29vEsnpBoB37Ug\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 14765,
    "path": "../public/_nuxt/DNwp4oih.js"
  },
  "/_nuxt/DQZds-lc.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e8b-k6vTkieXKrZpB5K4HCdurf+vVjo\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 3723,
    "path": "../public/_nuxt/DQZds-lc.js.br"
  },
  "/_nuxt/DQZds-lc.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"38c2-T52AqOZW+MEFVQjEsZgYM7A4vBs\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 14530,
    "path": "../public/_nuxt/DQZds-lc.js"
  },
  "/_nuxt/DQZds-lc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1069-ihyVYHqAq3Eu37tUn9L2Q9K5oTY\"",
    "mtime": "2026-05-24T05:56:58.915Z",
    "size": 4201,
    "path": "../public/_nuxt/DQZds-lc.js.gz"
  },
  "/_nuxt/DT9LmpJQ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f9e-qgfiu/UjbOwnjp+9eBKHGK2nYh8\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 3998,
    "path": "../public/_nuxt/DT9LmpJQ.js.br"
  },
  "/_nuxt/DT9LmpJQ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1177-EIODtWeQiVp/ZOFI5IJr8RlsLaY\"",
    "mtime": "2026-05-24T05:56:58.935Z",
    "size": 4471,
    "path": "../public/_nuxt/DT9LmpJQ.js.gz"
  },
  "/_nuxt/DXtvCTUw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"230-rKO7xz1edJI01BZR9scqMbzDbZ8\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 560,
    "path": "../public/_nuxt/DXtvCTUw.js.br"
  },
  "/_nuxt/DXtvCTUw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"267-fgwO+hT61knSJ5U5rM8IojtqNa4\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 615,
    "path": "../public/_nuxt/DXtvCTUw.js.gz"
  },
  "/_nuxt/DZ_KcWlU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"897-AP2Oul4G6dmchawzVdhxoaHLoPs\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 2199,
    "path": "../public/_nuxt/DZ_KcWlU.js.br"
  },
  "/_nuxt/DZ_KcWlU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9b0-lqZhSCkDFBaI7arCTSRGHsTr0Do\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 2480,
    "path": "../public/_nuxt/DZ_KcWlU.js.gz"
  },
  "/_nuxt/DdppU3iL.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a29-sobaB5lTr9b8StX6nERVMu1ghas\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 2601,
    "path": "../public/_nuxt/DdppU3iL.js"
  },
  "/_nuxt/DZ_KcWlU.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"20dd-SZXru9mrbxZKezJW/QeCi9Unm4M\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 8413,
    "path": "../public/_nuxt/DZ_KcWlU.js"
  },
  "/_nuxt/DXtvCTUw.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"455-caB8qTl4PxH0LsHA8tekjHwclyU\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 1109,
    "path": "../public/_nuxt/DXtvCTUw.js"
  },
  "/_nuxt/DT9LmpJQ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3490-8/ZUFrsJvD5j2oiJdObF8bqr2GE\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 13456,
    "path": "../public/_nuxt/DT9LmpJQ.js"
  },
  "/_nuxt/DdppU3iL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"428-HG6Sc/voaBiTsCpGw/LUeQZ5FUc\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 1064,
    "path": "../public/_nuxt/DdppU3iL.js.br"
  },
  "/_nuxt/DdppU3iL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4a2-1mS/y6fwR09z5oG5/6kgiioaC7U\"",
    "mtime": "2026-05-24T05:56:58.999Z",
    "size": 1186,
    "path": "../public/_nuxt/DdppU3iL.js.gz"
  },
  "/_nuxt/Dhq31QIW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6c0-LwbNatOv4ehIhmclrbxDvEbtCbk\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 1728,
    "path": "../public/_nuxt/Dhq31QIW.js"
  },
  "/_nuxt/Dhq31QIW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"30a-JuqWBYWEqXpbyhGLkBjgmuoYCAw\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 778,
    "path": "../public/_nuxt/Dhq31QIW.js.br"
  },
  "/_nuxt/Dhq31QIW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"35d-LxmlgRQ4K3qFY0J3hARG9dlovH8\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 861,
    "path": "../public/_nuxt/Dhq31QIW.js.gz"
  },
  "/_nuxt/DoaD4jbn.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"75b-fM76ldblOxb+YFgB+g2xQ5h3ww8\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 1883,
    "path": "../public/_nuxt/DoaD4jbn.js"
  },
  "/_nuxt/DoaD4jbn.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"351-ceQ7N04jC/yc2ICuxSHtIdlsKh0\"",
    "mtime": "2026-05-24T05:56:59.043Z",
    "size": 849,
    "path": "../public/_nuxt/DoaD4jbn.js.br"
  },
  "/_nuxt/DoaD4jbn.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3bf-tscjuJ6SW8dSeJ8jM9RrVVsTwbg\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 959,
    "path": "../public/_nuxt/DoaD4jbn.js.gz"
  },
  "/_nuxt/DowCp-W_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"bbf2-cptyfWaVTCtzyb5aFHGQVWCF0JQ\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 48114,
    "path": "../public/_nuxt/DowCp-W_.js"
  },
  "/_nuxt/DowCp-W_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"29fa-QhNxbugz8PNtqzz4+rb3dB1u5vc\"",
    "mtime": "2026-05-24T05:56:59.395Z",
    "size": 10746,
    "path": "../public/_nuxt/DowCp-W_.js.br"
  },
  "/_nuxt/DowCp-W_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2e57-DTpn/xz7aiFgMa8lKhPeFnkQvrA\"",
    "mtime": "2026-05-24T05:56:59.027Z",
    "size": 11863,
    "path": "../public/_nuxt/DowCp-W_.js.gz"
  },
  "/_nuxt/DtlNGWQ3.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"46f-wiHUkxFcp++pgvv99V1v8ROA5wA\"",
    "mtime": "2026-05-24T05:56:59.135Z",
    "size": 1135,
    "path": "../public/_nuxt/DtlNGWQ3.js.br"
  },
  "/_nuxt/DtlNGWQ3.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"aca-pK8LkEQ9cWUxK/QlEQOARwlLp2k\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 2762,
    "path": "../public/_nuxt/DtlNGWQ3.js"
  },
  "/_nuxt/DtlNGWQ3.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4f9-2ZawfFyfbs6pz8YFqFFyTS4fb2Y\"",
    "mtime": "2026-05-24T05:56:59.043Z",
    "size": 1273,
    "path": "../public/_nuxt/DtlNGWQ3.js.gz"
  },
  "/_nuxt/Du2FmWTL.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2a77-MrLgDd30X5l5eXz4LFxeB5G1drA\"",
    "mtime": "2026-05-24T05:56:55.450Z",
    "size": 10871,
    "path": "../public/_nuxt/Du2FmWTL.js"
  },
  "/_nuxt/Du2FmWTL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"bbb-RcfjJftwJ2MiRGob3B+mEGfVZTQ\"",
    "mtime": "2026-05-24T05:56:59.159Z",
    "size": 3003,
    "path": "../public/_nuxt/Du2FmWTL.js.br"
  },
  "/_nuxt/Du2FmWTL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d14-2sm5sJzdZB6ebmeBk8Uk07mzyqM\"",
    "mtime": "2026-05-24T05:56:59.135Z",
    "size": 3348,
    "path": "../public/_nuxt/Du2FmWTL.js.gz"
  },
  "/_nuxt/DvZpPtH7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"70c-MdKq+fz8r5fWAo194kM5K57iDbs\"",
    "mtime": "2026-05-24T05:56:59.135Z",
    "size": 1804,
    "path": "../public/_nuxt/DvZpPtH7.js.br"
  },
  "/_nuxt/DvZpPtH7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7bc-O19Kqa3YrSXshCzCHNHpbSWTO0g\"",
    "mtime": "2026-05-24T05:56:59.135Z",
    "size": 1980,
    "path": "../public/_nuxt/DvZpPtH7.js.gz"
  },
  "/_nuxt/DvZpPtH7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1640-aWkGeuYAQM8Rl7mFYE5vbj08lCc\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 5696,
    "path": "../public/_nuxt/DvZpPtH7.js"
  },
  "/_nuxt/Hd9L2Xsj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4d8-suqV3Avgh8vTLetrXCDfhzUmljU\"",
    "mtime": "2026-05-24T05:56:59.139Z",
    "size": 1240,
    "path": "../public/_nuxt/Hd9L2Xsj.js.br"
  },
  "/_nuxt/Hd9L2Xsj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"561-VyZId5eLN2xh/NVBI43T0HJAKJc\"",
    "mtime": "2026-05-24T05:56:59.135Z",
    "size": 1377,
    "path": "../public/_nuxt/Hd9L2Xsj.js.gz"
  },
  "/_nuxt/OsF691ww.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4823-MsfpIMu22XrKOSin/sPYuTlIiq8\"",
    "mtime": "2026-05-24T05:57:01.759Z",
    "size": 18467,
    "path": "../public/_nuxt/OsF691ww.js.br"
  },
  "/_nuxt/OsF691ww.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"50e4-NvWTXFDdJ8pJomKwvUh9bmgB/ZM\"",
    "mtime": "2026-05-24T05:56:59.391Z",
    "size": 20708,
    "path": "../public/_nuxt/OsF691ww.js.gz"
  },
  "/_nuxt/Hd9L2Xsj.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"b46-6Zx6Vfpy1gX6P99m9UHau/SnoPA\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 2886,
    "path": "../public/_nuxt/Hd9L2Xsj.js"
  },
  "/_nuxt/OsF691ww.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"12350-UZm1bKUniVo5iIg5uBh19+NAMqk\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 74576,
    "path": "../public/_nuxt/OsF691ww.js"
  },
  "/_nuxt/Ua3fg1c1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2bf-Hr6N7pJLua+Dsv/2aBT01JKz49I\"",
    "mtime": "2026-05-24T05:56:59.391Z",
    "size": 703,
    "path": "../public/_nuxt/Ua3fg1c1.js.br"
  },
  "/_nuxt/Ua3fg1c1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"304-pZG10EAC9dK/WakqM39z+PaWGGw\"",
    "mtime": "2026-05-24T05:56:59.391Z",
    "size": 772,
    "path": "../public/_nuxt/Ua3fg1c1.js.gz"
  },
  "/_nuxt/WYjdr6LI.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"fdf4-emC5fCeQ0jM4ChuzXt1vZzHZ4/k\"",
    "mtime": "2026-05-24T05:57:03.695Z",
    "size": 65012,
    "path": "../public/_nuxt/WYjdr6LI.js.br"
  },
  "/_nuxt/Ua3fg1c1.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7b5-6seuDIXdACM60jmhWupunlrnO40\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 1973,
    "path": "../public/_nuxt/Ua3fg1c1.js"
  },
  "/_nuxt/WYjdr6LI.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"126ad-d/cCjucwcGww1YDCjfDYWQqAs9Y\"",
    "mtime": "2026-05-24T05:57:00.891Z",
    "size": 75437,
    "path": "../public/_nuxt/WYjdr6LI.js.gz"
  },
  "/_nuxt/WYjdr6LI.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3aad9-nbVSdemfJKYmEZgomLdGTqgK5E8\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 240345,
    "path": "../public/_nuxt/WYjdr6LI.js"
  },
  "/_nuxt/Zjen-QfV.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"76b-RRur1JWIviobhNUL5TtTfLaQny4\"",
    "mtime": "2026-05-24T05:57:00.779Z",
    "size": 1899,
    "path": "../public/_nuxt/Zjen-QfV.js.br"
  },
  "/_nuxt/Zjen-QfV.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"826-4LAYpH7fQHVdt1B5klWV8xH/d4U\"",
    "mtime": "2026-05-24T05:57:00.083Z",
    "size": 2086,
    "path": "../public/_nuxt/Zjen-QfV.js.gz"
  },
  "/_nuxt/Zw-KfJb-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2f4-NF7JKtaPAxuJN29yrZAptY5Gx9M\"",
    "mtime": "2026-05-24T05:57:01.667Z",
    "size": 756,
    "path": "../public/_nuxt/Zw-KfJb-.js.br"
  },
  "/_nuxt/Zw-KfJb-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"35f-zCcmI+m07Eq94eXl7KHvaicfNPw\"",
    "mtime": "2026-05-24T05:57:01.615Z",
    "size": 863,
    "path": "../public/_nuxt/Zw-KfJb-.js.gz"
  },
  "/_nuxt/eJDJJ1uC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7d-AgkwXvh2cGQUqUDq08j9ikt4y1E\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 125,
    "path": "../public/_nuxt/eJDJJ1uC.js"
  },
  "/_nuxt/Zw-KfJb-.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"86b-wr6uWDNG2niMkoFFl6g9Inj3tS4\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 2155,
    "path": "../public/_nuxt/Zw-KfJb-.js"
  },
  "/_nuxt/Zjen-QfV.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1621-QiDESRGjeXWa5Ku1BE0a8+lT9UM\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 5665,
    "path": "../public/_nuxt/Zjen-QfV.js"
  },
  "/_nuxt/entry.C2weaOHI.css": {
    "type": "text/css; charset=utf-8",
    "encoding": null,
    "etag": "\"3277b-YL4IVqsoy6o9WpuN6YphKARQ4iQ\"",
    "mtime": "2026-05-24T05:56:55.458Z",
    "size": 206715,
    "path": "../public/_nuxt/entry.C2weaOHI.css"
  },
  "/_nuxt/entry.C2weaOHI.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"5b2b-hFaOYGGXV3Bex4CDQmdWN7LnC5c\"",
    "mtime": "2026-05-24T05:57:04.363Z",
    "size": 23339,
    "path": "../public/_nuxt/entry.C2weaOHI.css.br"
  },
  "/_nuxt/entry.C2weaOHI.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"73c2-Rt0q2KkKQT3Um7ow9V1LQdfwVE0\"",
    "mtime": "2026-05-24T05:57:02.471Z",
    "size": 29634,
    "path": "../public/_nuxt/entry.C2weaOHI.css.gz"
  },
  "/_nuxt/index.DMySTDoR.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"198-jlvPxZ7JyBN3u2E73OPacEg/xlc\"",
    "mtime": "2026-05-24T05:56:55.458Z",
    "size": 408,
    "path": "../public/_nuxt/index.DMySTDoR.css"
  },
  "/_nuxt/rqlf6rKU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4e7-Mv1FPFZi2QCU2Jiz193tCjDTaV0\"",
    "mtime": "2026-05-24T05:57:03.187Z",
    "size": 1255,
    "path": "../public/_nuxt/rqlf6rKU.js.br"
  },
  "/_nuxt/rqlf6rKU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"55f-4ITApGGOTxjXr+EUwxk3/IJ2C4g\"",
    "mtime": "2026-05-24T05:57:03.031Z",
    "size": 1375,
    "path": "../public/_nuxt/rqlf6rKU.js.gz"
  },
  "/_nuxt/wNyQAzI_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"430-/LhZPbuctuEHp49dAr48G8HlkNU\"",
    "mtime": "2026-05-24T05:57:03.327Z",
    "size": 1072,
    "path": "../public/_nuxt/wNyQAzI_.js.br"
  },
  "/_nuxt/wNyQAzI_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4a1-YXAkdt0AIj2f3cRuEYQaYBZz450\"",
    "mtime": "2026-05-24T05:57:03.267Z",
    "size": 1185,
    "path": "../public/_nuxt/wNyQAzI_.js.gz"
  },
  "/_nuxt/fyG5So81.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d2-3ehrGJT2B6spGiD5+1mMDAPviEo\"",
    "mtime": "2026-05-24T05:56:55.454Z",
    "size": 722,
    "path": "../public/_nuxt/fyG5So81.js"
  },
  "/_nuxt/wNyQAzI_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"92b-U2wQQm3MnBwGBCfw2BaEZyUBFwo\"",
    "mtime": "2026-05-24T05:56:55.458Z",
    "size": 2347,
    "path": "../public/_nuxt/wNyQAzI_.js"
  },
  "/_nuxt/rqlf6rKU.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a8f-Tka3VVt8X89G6Bad68uIfCg9d8M\"",
    "mtime": "2026-05-24T05:56:55.458Z",
    "size": 2703,
    "path": "../public/_nuxt/rqlf6rKU.js"
  },
  "/sitemap.xml/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"5c-nOYx0j/vwQqH01HJnHMu1XOc4ho\"",
    "mtime": "2026-05-24T05:56:55.074Z",
    "size": 92,
    "path": "../public/sitemap.xml/index.html"
  },
  "/_nuxt/builds/meta/cf39bdf2-0355-47e7-8c61-ecce75d07593.json": {
    "type": "application/json",
    "etag": "\"58-pGEVOt5IeP1iJE/6iBwcObQ+XKE\"",
    "mtime": "2026-05-24T05:56:55.238Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/cf39bdf2-0355-47e7-8c61-ecce75d07593.json"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-uj+X3cVeVD47SrXqo+H5R/eYgps\"",
    "mtime": "2026-05-24T05:56:55.246Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_fonts/":{"maxAge":31536000},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _BpYFM2 = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const AUTH_COOKIE_NAME = "netcoreops_session";
const AUTH_MAX_AGE_SECONDS = 12 * 60 * 60;
function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}
function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
function getAuthConfig(env = process.env) {
  return {
    enabled: env.NETCOREOPS_AUTH_DISABLED !== "true",
    username: env.NETCOREOPS_AUTH_USERNAME || env.NETCOREOPS_OPERATOR_USERNAME || "admin",
    password: env.NETCOREOPS_AUTH_PASSWORD || "admin",
    sessionSecret: env.NETCOREOPS_AUTH_SESSION_SECRET || env.NETCOREOPS_SECRET_KEY || "netcoreops-local-session-secret"
  };
}
function validateLocalLogin(input, config = getAuthConfig()) {
  return input.username === config.username && input.password === config.password;
}
function createAuthSessionToken(input) {
  const payload = base64Url(JSON.stringify({
    userId: input.userId,
    username: input.username,
    name: input.name,
    email: input.email,
    groupId: input.groupId,
    groupName: input.groupName,
    isAdmin: input.isAdmin,
    permissions: input.permissions || [],
    issuedAt: (input.issuedAt || /* @__PURE__ */ new Date()).toISOString()
  }));
  return `${payload}.${sign(payload, input.secret)}`;
}
function validateAuthSessionToken(token, secret, options = {}) {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = sign(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const issuedAt = new Date(session.issuedAt);
    if (!session.username || Number.isNaN(issuedAt.getTime())) return null;
    const now = options.now || /* @__PURE__ */ new Date();
    const maxAgeMs = (options.maxAgeSeconds || AUTH_MAX_AGE_SECONDS) * 1e3;
    if (now.getTime() - issuedAt.getTime() > maxAgeMs) return null;
    return session;
  } catch {
    return null;
  }
}

const publicPathPrefixes = [
  "/_nuxt/",
  "/__nuxt",
  "/api/auth/",
  "/api/netflow/ingest-aggregate",
  "/favicon.ico",
  "/robots.txt"
];
function isPublicPath(pathname) {
  return pathname === "/login" || publicPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}
const _LlRz7B = defineEventHandler(async (event) => {
  const config = getAuthConfig();
  if (!config.enabled) return;
  const pathname = getRequestURL(event).pathname;
  if (isPublicPath(pathname)) return;
  const session = validateAuthSessionToken(getCookie(event, AUTH_COOKIE_NAME), config.sessionSecret);
  if (session) {
    event.context.auth = session;
    return;
  }
  if (pathname.startsWith("/api/")) {
    throw createError$1({ statusCode: 401, statusMessage: "Wymagana autoryzacja" });
  }
  return sendRedirect(event, "/login", 302);
});

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
	
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const sevenDigitCodeSchema = z.string().regex(/^[0-9]{7}$/, "Kod musi mie\u0107 dok\u0142adnie 7 cyfr");
const emptyToNull = (value) => value === "" ? null : value;
const optionalText = z.preprocess(emptyToNull, z.string().trim().max(255).optional().nullable());
const optionalManagementIp = z.preprocess(emptyToNull, z.string().trim().max(45).regex(/^[0-9a-fA-F:.]+$/, "Niepoprawny adres IP").optional().nullable());
const optionalHostname = z.preprocess(emptyToNull, z.string().trim().max(255).regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/, "Niepoprawny hostname").optional().nullable());
const addressReferenceSchema = z.object({
  terytCode: sevenDigitCodeSchema,
  simcCode: sevenDigitCodeSchema,
  ulicCode: z.string().regex(/^[0-9]{5,7}$/).nullable().optional(),
  buildingNumber: z.string().max(30).nullable().optional(),
  apartmentNumber: z.string().max(30).nullable().optional()
});
const createNodeSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  nodeType: z.enum(["SZKIELETOWY", "DYSTRYBUCYJNY"]),
  mediumCode: z.string().max(50).nullable().optional(),
  address: addressReferenceSchema.nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"]).default("PLANNED")
});
const createLineSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  nodeStartId: z.string().uuid(),
  nodeEndId: z.string().uuid(),
  mediumCode: z.string().max(50).nullable().optional(),
  fiberCount: z.number().int().nonnegative().nullable().optional(),
  lengthMeters: z.number().nonnegative().nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"]).default("ACTIVE")
});
const createEquipmentSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  modelId: z.number().int().positive(),
  nodeId: z.string().uuid().nullable().optional(),
  accessProfileId: z.number().int().positive().nullable().optional(),
  managementDriverId: z.number().int().positive().nullable().optional(),
  parentEquipmentId: z.string().uuid().nullable().optional(),
  hostname: optionalHostname,
  managementIp: optionalManagementIp,
  managementPort: z.number().int().positive().max(65535).nullable().optional(),
  managementProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf"]).nullable().optional(),
  loginUrl: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  macAddress: z.string().max(17).nullable().optional(),
  serialNumber: z.string().max(100).nullable().optional(),
  equipmentRole: z.enum(["BACKBONE", "CLIENT_PE"]),
  bridgeMode: z.boolean().default(false),
  onuPort: optionalText,
  onuId: optionalText,
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  status: z.enum(["IN_USE", "SPARE", "FAILED", "DECOMMISSIONED"]).default("IN_USE")
});
const customerBaseSchema = z.object({
  customerType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  fullName: z.string().max(255).nullable().optional(),
  firstName: optionalText,
  lastName: optionalText,
  pesel: z.preprocess(emptyToNull, z.string().regex(/^[0-9]{11}$/, "PESEL musi mie\u0107 11 cyfr").nullable().optional()),
  identityDocumentNumber: optionalText,
  companyName: optionalText,
  taxId: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  regon: z.preprocess(emptyToNull, z.string().regex(/^[0-9]{9,14}$/, "REGON musi mie\u0107 9 albo 14 cyfr").nullable().optional()),
  krs: z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  representativeName: optionalText,
  contactEmail: z.preprocess(emptyToNull, z.string().email().nullable().optional()),
  contactPhone: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  billingAddressRef: addressReferenceSchema.nullable().optional(),
  billingAddress: z.preprocess(emptyToNull, z.string().nullable().optional())
});
const createCustomerSchema = customerBaseSchema.superRefine((value, ctx) => {
  if (value.customerType === "INDIVIDUAL" && (!value.firstName || !value.lastName)) {
    ctx.addIssue({
      code: "custom",
      path: ["firstName"],
      message: "Klient indywidualny wymaga imienia i nazwiska"
    });
  }
  if (value.customerType === "BUSINESS" && !value.companyName) {
    ctx.addIssue({
      code: "custom",
      path: ["companyName"],
      message: "Firma wymaga nazwy"
    });
  }
});
const createServiceSchema = z.object({
  customerId: z.string().uuid(),
  profileId: z.number().int().positive(),
  equipmentId: z.string().uuid().nullable().optional(),
  address: addressReferenceSchema,
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED"]).default("PENDING")
});
const importDictionariesSchema = z.object({
  type: z.enum(["medium", "technology", "teryt", "simc", "ulic"]),
  rows: z.array(z.record(z.string(), z.unknown())).min(1)
});
const createAccessProfileSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  technologyTypeId: z.number().int().positive().nullable().optional(),
  downloadSpeedMbps: z.number().int().positive().nullable().optional(),
  uploadSpeedMbps: z.number().int().positive().nullable().optional(),
  isSymmetric: z.boolean().default(false),
  defaultProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"]).default("ssh"),
  defaultPort: z.number().int().positive().max(65535).nullable().optional(),
  username: optionalText,
  passwordEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  snmpCommunityEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiBaseUrl: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiTokenEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sshKeyEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  extraConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().default(true)
});
const createTariffSchema = z.object({
  name: z.string().min(1).max(128),
  serviceType: z.enum(["internet", "iptv", "voip", "other"]).default("internet"),
  defaultNetPrice: z.coerce.number().nonnegative().default(0),
  vatRate: z.coerce.number().nonnegative().max(100).default(23),
  downloadMbps: z.number().int().positive().nullable().optional(),
  uploadMbps: z.number().int().positive().nullable().optional(),
  queueName: optionalText,
  iptvPackageCode: optionalText,
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().default(true)
});
const createCustomerDeviceSchema = z.object({
  customerId: z.string().uuid(),
  equipmentId: z.string().uuid().nullable().optional(),
  onuEquipmentId: z.string().uuid().nullable().optional(),
  hostname: z.string().min(1).max(255),
  ipAddress: optionalManagementIp,
  macAddress: z.preprocess(emptyToNull, z.string().max(17).nullable().optional()),
  login: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).default("ACTIVE"),
  ipNetworkName: optionalText,
  dhcpServer: optionalText,
  dhcpInterface: optionalText,
  oltPort: optionalText,
  onuId: optionalText,
  importExternalId: optionalText,
  importIssues: z.array(z.string()).optional(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
});
const archiveSchema = z.object({
  archiveReason: z.preprocess(emptyToNull, z.string().max(500).nullable().optional())
});
const updateCustomerSchema = customerBaseSchema.partial();
const updateCustomerDeviceSchema = createCustomerDeviceSchema.partial();
const updateServiceSchema = createServiceSchema.partial();
const updateNodeSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255).optional(),
  nodeType: z.enum(["SZKIELETOWY", "DYSTRYBUCYJNY"]).optional(),
  mediumCode: z.string().max(50).nullable().optional(),
  address: addressReferenceSchema.nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"]).optional()
});
const updateLineSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  nodeStartId: z.string().uuid().optional(),
  nodeEndId: z.string().uuid().optional(),
  mediumCode: z.string().max(50).nullable().optional(),
  fiberCount: z.number().int().nonnegative().nullable().optional(),
  lengthMeters: z.number().nonnegative().nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"]).optional()
});
const updateEquipmentSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  modelId: z.number().int().positive().optional(),
  nodeId: z.string().uuid().nullable().optional(),
  accessProfileId: z.number().int().positive().nullable().optional(),
  managementDriverId: z.number().int().positive().nullable().optional(),
  parentEquipmentId: z.string().uuid().nullable().optional(),
  hostname: optionalHostname,
  managementIp: optionalManagementIp,
  managementPort: z.number().int().positive().max(65535).nullable().optional(),
  managementProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf"]).nullable().optional(),
  loginUrl: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  macAddress: z.string().max(17).nullable().optional(),
  serialNumber: z.string().max(100).nullable().optional(),
  equipmentRole: z.enum(["BACKBONE", "CLIENT_PE"]).optional(),
  bridgeMode: z.boolean().optional(),
  onuPort: optionalText,
  onuId: optionalText,
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  status: z.enum(["IN_USE", "SPARE", "FAILED", "DECOMMISSIONED"]).optional()
});
const updateAccessProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  technologyTypeId: z.number().int().positive().nullable().optional(),
  downloadSpeedMbps: z.number().int().positive().nullable().optional(),
  uploadSpeedMbps: z.number().int().positive().nullable().optional(),
  isSymmetric: z.boolean().optional(),
  defaultProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"]).optional(),
  defaultPort: z.number().int().positive().max(65535).nullable().optional(),
  username: optionalText,
  passwordEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  snmpCommunityEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiBaseUrl: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiTokenEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sshKeyEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  extraConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().optional()
});
const updateTariffSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  serviceType: z.enum(["internet", "iptv", "voip", "other"]).optional(),
  defaultNetPrice: z.coerce.number().nonnegative().optional(),
  vatRate: z.coerce.number().nonnegative().max(100).optional(),
  downloadMbps: z.number().int().positive().nullable().optional(),
  uploadMbps: z.number().int().positive().nullable().optional(),
  queueName: optionalText,
  iptvPackageCode: optionalText,
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().optional()
});
const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  customerDeviceId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]).default("ACTIVE"),
  billingPeriod: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  priceOverrideNet: z.coerce.number().nonnegative().nullable().optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  activationFee: z.coerce.number().nonnegative().default(0),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
});
const updateSubscriptionSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerDeviceId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]).optional(),
  billingPeriod: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  priceOverrideNet: z.coerce.number().nonnegative().nullable().optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  activationFee: z.coerce.number().nonnegative().optional(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
});
const importModeSchema = z.object({
  mode: z.enum(["preview", "apply", "dryRun"]).default("preview"),
  activeOnly: z.boolean().default(true),
  limit: z.coerce.number().int().positive().max(500).optional(),
  rangeFrom: z.coerce.number().int().positive().max(1e4).optional(),
  rangeTo: z.coerce.number().int().positive().max(1e4).optional()
});
const createAccessProfileBindingSchema = z.object({
  profileId: z.number().int().positive(),
  modelId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  managementProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf"]).default("ssh"),
  configTemplate: z.string().nullable().optional(),
  configPayload: z.record(z.string(), z.unknown()).nullable().optional(),
  priority: z.number().int().min(0).max(1e4).default(100),
  isActive: z.boolean().default(true)
}).refine((value) => value.modelId || value.equipmentId, {
  path: ["modelId"],
  message: "Powi\u0105zanie wymaga modelu albo konkretnego urz\u0105dzenia"
});
const createAutomationScriptSchema = z.object({
  name: z.string().min(1).max(120),
  scope: z.enum(["DEVICE", "PROFILE", "CUSTOMER_SERVICE"]).default("DEVICE"),
  triggerType: z.enum(["MANUAL", "PROFILE_APPLIED", "SERVICE_ACTIVATED", "DEVICE_DISCOVERED", "SCHEDULED_30_MIN"]).default("MANUAL"),
  scriptLanguage: z.enum(["bash", "python", "ansible", "expect", "typescript", "tsx"]).default("bash"),
  scriptBody: z.string().min(1),
  profileId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  isEnabled: z.boolean().default(false),
  timeoutSeconds: z.number().int().positive().max(3600).default(60)
});
const updateAutomationScriptSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  scope: z.enum(["DEVICE", "PROFILE", "CUSTOMER_SERVICE"]).optional(),
  triggerType: z.enum(["MANUAL", "PROFILE_APPLIED", "SERVICE_ACTIVATED", "DEVICE_DISCOVERED", "SCHEDULED_30_MIN"]).optional(),
  scriptLanguage: z.enum(["bash", "python", "ansible", "expect", "typescript", "tsx"]).optional(),
  scriptBody: z.string().min(1).optional(),
  profileId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  isEnabled: z.boolean().optional(),
  timeoutSeconds: z.number().int().positive().max(3600).optional()
});
const automationVariableDefinitionBaseSchema = z.object({
  variableName: z.string().trim().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Nazwa zmiennej mo\u017Ce zawiera\u0107 litery, cyfry i _"),
  label: optionalText,
  valueType: z.enum(["string", "int", "date", "bool"]).default("string"),
  sourceType: z.enum(["STATIC", "DATABASE"]).default("DATABASE"),
  tableName: optionalText,
  rowLookupColumn: optionalText,
  rowLookupValue: optionalText,
  fieldName: optionalText,
  staticValue: z.preprocess(emptyToNull, z.string().nullable().optional()),
  fallbackValue: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().default(true)
});
function validateAutomationVariableDefinition(value, ctx) {
  if (value.sourceType === "STATIC" && !value.staticValue) {
    ctx.addIssue({
      code: "custom",
      path: ["staticValue"],
      message: "Zmienna statyczna wymaga warto\u015Bci"
    });
  }
  if (value.sourceType === "DATABASE" && (!value.tableName || !value.rowLookupColumn || !value.rowLookupValue || !value.fieldName)) {
    ctx.addIssue({
      code: "custom",
      path: ["tableName"],
      message: "Zmienna z bazy wymaga tabeli, wiersza i pola"
    });
  }
}
const createAutomationVariableDefinitionSchema = automationVariableDefinitionBaseSchema.superRefine(validateAutomationVariableDefinition);
const updateAutomationVariableDefinitionSchema = automationVariableDefinitionBaseSchema.partial().superRefine((value, ctx) => {
  var _a;
  if (!value.sourceType) return;
  validateAutomationVariableDefinition({
    variableName: value.variableName || "_",
    label: value.label,
    valueType: value.valueType || "string",
    sourceType: value.sourceType,
    tableName: value.tableName,
    rowLookupColumn: value.rowLookupColumn,
    rowLookupValue: value.rowLookupValue,
    fieldName: value.fieldName,
    staticValue: value.staticValue,
    fallbackValue: value.fallbackValue,
    isActive: (_a = value.isActive) != null ? _a : true
  }, ctx);
});
const renderAutomationScriptSchema = z.object({
  variables: z.record(z.string(), z.string()).optional().default({})
});

const sevenDigitCode = (column) => sql`${column} ~ '^[0-9]{7}$'`;
const optionalShortDictionaryCode = (column) => sql`${column} ~ '^[0-9]{5,7}$'`;
const ukeMediumTypes = pgTable("uke_medium_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  importedAt: timestamp("imported_at").defaultNow().notNull()
});
const ukeTechnologyTypes = pgTable("uke_technology_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  importedAt: timestamp("imported_at").defaultNow().notNull()
});
const terytAreas = pgTable("teryt_areas", {
  id: serial("id").primaryKey(),
  terytCode: varchar("teryt_code", { length: 7 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  areaType: varchar("area_type", { length: 100 }),
  voivodeship: varchar("voivodeship", { length: 120 }),
  county: varchar("county", { length: 120 }),
  commune: varchar("commune", { length: 120 }),
  importedAt: timestamp("imported_at").defaultNow().notNull()
}, (table) => [
  check("teryt_areas_code_check", sevenDigitCode(table.terytCode))
]);
const simcLocalities = pgTable("simc_localities", {
  id: serial("id").primaryKey(),
  simcCode: varchar("simc_code", { length: 7 }).notNull().unique(),
  terytAreaId: integer("teryt_area_id").references(() => terytAreas.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  localityType: varchar("locality_type", { length: 120 }),
  importedAt: timestamp("imported_at").defaultNow().notNull()
}, (table) => [
  check("simc_localities_code_check", sevenDigitCode(table.simcCode))
]);
const ulicStreets = pgTable("ulic_streets", {
  id: serial("id").primaryKey(),
  ulicCode: varchar("ulic_code", { length: 7 }).notNull(),
  simcLocalityId: integer("simc_locality_id").references(() => simcLocalities.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  streetType: varchar("street_type", { length: 80 }),
  importedAt: timestamp("imported_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ulic_streets_simc_code_idx").on(table.simcLocalityId, table.ulicCode),
  check("ulic_streets_code_check", optionalShortDictionaryCode(table.ulicCode))
]);
const deviceTypes = pgTable("device_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description")
});
const deviceModels = pgTable("device_models", {
  id: serial("id").primaryKey(),
  typeId: integer("type_id").references(() => deviceTypes.id, { onDelete: "restrict" }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }).notNull(),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  technologyTypeId: integer("technology_type_id").references(() => ukeTechnologyTypes.id, { onDelete: "set null" }),
  portsUpstream: integer("ports_upstream").default(0).notNull(),
  portsDownstream: integer("ports_downstream").default(0).notNull(),
  powerConsumptionWatt: doublePrecision("power_consumption_watt"),
  throughputCapabilities: jsonb("throughput_capabilities")
}, (table) => [
  uniqueIndex("device_models_manufacturer_model_idx").on(table.manufacturer, table.modelName)
]);
const accessProfiles = pgTable("access_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  technologyTypeId: integer("technology_type_id").references(() => ukeTechnologyTypes.id, { onDelete: "set null" }),
  downloadSpeedMbps: integer("download_speed_mbps"),
  uploadSpeedMbps: integer("upload_speed_mbps"),
  isSymmetric: boolean("is_symmetric").default(false).notNull(),
  defaultProtocol: varchar("default_protocol", { length: 30 }).default("ssh").notNull(),
  defaultPort: integer("default_port"),
  username: varchar("username", { length: 120 }),
  passwordEncrypted: text("password_encrypted"),
  snmpCommunityEncrypted: text("snmp_community_encrypted"),
  apiBaseUrl: text("api_base_url"),
  apiTokenEncrypted: text("api_token_encrypted"),
  sshKeyEncrypted: text("ssh_key_encrypted"),
  extraConfig: jsonb("extra_config"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const managementDrivers = pgTable("management_drivers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  transport: varchar("transport", { length: 50 }).notNull(),
  capabilities: jsonb("capabilities"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const networkNodes = pgTable("network_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  inventoryId: varchar("inventory_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nodeType: varchar("node_type", { length: 50 }).notNull(),
  mediumTypeId: integer("medium_type_id").references(() => ukeMediumTypes.id, { onDelete: "set null" }),
  terytAreaId: integer("teryt_area_id").references(() => terytAreas.id, { onDelete: "set null" }),
  simcLocalityId: integer("simc_locality_id").references(() => simcLocalities.id, { onDelete: "set null" }),
  streetId: integer("street_id").references(() => ulicStreets.id, { onDelete: "set null" }),
  buildingNumber: varchar("building_number", { length: 30 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  status: varchar("status", { length: 50 }).default("PLANNED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const networkLines = pgTable("network_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  inventoryId: varchar("inventory_id", { length: 100 }).notNull().unique(),
  nodeStartId: uuid("node_start_id").references(() => networkNodes.id, { onDelete: "restrict" }).notNull(),
  nodeEndId: uuid("node_end_id").references(() => networkNodes.id, { onDelete: "restrict" }).notNull(),
  mediumTypeId: integer("medium_type_id").references(() => ukeMediumTypes.id, { onDelete: "set null" }),
  fiberCount: integer("fiber_count"),
  lengthMeters: doublePrecision("length_meters"),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull()
});
const networkEquipment = pgTable("network_equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  inventoryId: varchar("inventory_id", { length: 100 }).notNull().unique(),
  modelId: integer("model_id").references(() => deviceModels.id, { onDelete: "restrict" }).notNull(),
  nodeId: uuid("node_id").references(() => networkNodes.id, { onDelete: "set null" }),
  accessProfileId: integer("access_profile_id").references(() => accessProfiles.id, { onDelete: "set null" }),
  managementDriverId: integer("management_driver_id").references(() => managementDrivers.id, { onDelete: "set null" }),
  parentEquipmentId: uuid("parent_equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  hostname: varchar("hostname", { length: 255 }).unique(),
  managementIp: varchar("management_ip", { length: 45 }).unique(),
  managementPort: integer("management_port"),
  managementProtocol: varchar("management_protocol", { length: 30 }),
  loginUrl: text("login_url"),
  macAddress: varchar("mac_address", { length: 17 }).unique(),
  serialNumber: varchar("serial_number", { length: 100 }).unique(),
  equipmentRole: varchar("equipment_role", { length: 50 }).notNull(),
  bridgeMode: boolean("bridge_mode").default(false).notNull(),
  onuPort: varchar("onu_port", { length: 32 }),
  onuId: varchar("onu_id", { length: 32 }),
  notes: text("notes"),
  lastSeenAt: timestamp("last_seen_at"),
  isOnline: boolean("is_online").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("IN_USE").notNull()
});
const ipNetworks = pgTable("ip_networks", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  cidr: varchar("cidr", { length: 64 }).notNull().unique(),
  gateway: varchar("gateway", { length: 45 }),
  vlanId: integer("vlan_id"),
  ownerNodeId: uuid("owner_node_id").references(() => networkNodes.id, { onDelete: "set null" }),
  ownerEquipmentId: uuid("owner_equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const ftthOlts = pgTable("ftth_olts", {
  id: uuid("id").defaultRandom().primaryKey(),
  networkEquipmentId: uuid("network_equipment_id").references(() => networkEquipment.id, { onDelete: "cascade" }).notNull().unique(),
  vendor: varchar("vendor", { length: 80 }).default("Dasan").notNull(),
  model: varchar("model", { length: 120 }),
  managementVlanId: integer("management_vlan_id").default(400).notNull(),
  description: text(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const ftthPonPorts = pgTable("ftth_pon_ports", {
  id: uuid("id").defaultRandom().primaryKey(),
  oltId: uuid("olt_id").references(() => ftthOlts.id, { onDelete: "cascade" }).notNull(),
  portCode: varchar("port_code", { length: 32 }).notNull(),
  label: varchar("label", { length: 160 }),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ftth_pon_ports_olt_port_idx").on(table.oltId, table.portCode)
]);
const ftthOnus = pgTable("ftth_onus", {
  id: uuid("id").defaultRandom().primaryKey(),
  ponPortId: uuid("pon_port_id").references(() => ftthPonPorts.id, { onDelete: "cascade" }).notNull(),
  networkEquipmentId: uuid("network_equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  onuIdentifier: varchar("onu_identifier", { length: 32 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  status: varchar("status", { length: 50 }).default("UNKNOWN").notNull(),
  signalRx: varchar("signal_rx", { length: 50 }),
  transparentCandidate: boolean("transparent_candidate").default(false).notNull(),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ftth_onus_pon_identifier_idx").on(table.ponPortId, table.onuIdentifier),
  uniqueIndex("ftth_onus_serial_idx").on(table.serialNumber)
]);
const ftthOnuIpHosts = pgTable("ftth_onu_ip_hosts", {
  id: uuid("id").defaultRandom().primaryKey(),
  onuId: uuid("onu_id").references(() => ftthOnus.id, { onDelete: "cascade" }).notNull(),
  hostId: varchar("host_id", { length: 32 }).notNull(),
  ipOption: varchar("ip_option", { length: 80 }),
  macAddress: varchar("mac_address", { length: 17 }),
  currentIp: varchar("current_ip", { length: 45 }),
  currentMask: varchar("current_mask", { length: 45 }),
  currentGateway: varchar("current_gateway", { length: 45 }),
  primaryDns: varchar("primary_dns", { length: 45 }),
  secondaryDns: varchar("secondary_dns", { length: 45 }),
  hostName: varchar("host_name", { length: 255 }),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ftth_onu_ip_hosts_onu_host_idx").on(table.onuId, table.hostId)
]);
const ftthOnuMacs = pgTable("ftth_onu_macs", {
  id: uuid("id").defaultRandom().primaryKey(),
  onuId: uuid("onu_id").references(() => ftthOnus.id, { onDelete: "cascade" }).notNull(),
  macAddress: varchar("mac_address", { length: 17 }).notNull(),
  vlanId: integer("vlan_id"),
  gemId: varchar("gem_id", { length: 32 }),
  sourceCommand: varchar("source_command", { length: 120 }).notNull(),
  status: varchar("status", { length: 50 }).default("dynamic").notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ftth_onu_macs_onu_mac_idx").on(table.onuId, table.macAddress)
]);
const customerDevices = pgTable("customer_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  onuEquipmentId: uuid("onu_equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  ftthOnuId: uuid("ftth_onu_id").references(() => ftthOnus.id, { onDelete: "set null" }),
  hostname: varchar("hostname", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  macAddress: varchar("mac_address", { length: 17 }).unique(),
  login: varchar("login", { length: 120 }),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  ipNetworkName: varchar("ip_network_name", { length: 128 }),
  dhcpServer: varchar("dhcp_server", { length: 128 }),
  dhcpInterface: varchar("dhcp_interface", { length: 128 }),
  oltPort: varchar("olt_port", { length: 32 }),
  onuId: varchar("onu_id", { length: 32 }),
  importExternalId: varchar("import_external_id", { length: 80 }),
  importIssues: jsonb("import_issues").$type().default([]).notNull(),
  notes: text("notes"),
  archivedAt: timestamp("archived_at"),
  archiveReason: text("archive_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const ftthTransparentLinks = pgTable("ftth_transparent_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  onuId: uuid("onu_id").references(() => ftthOnus.id, { onDelete: "cascade" }).notNull(),
  macAddress: varchar("mac_address", { length: 17 }).notNull(),
  linkType: varchar("link_type", { length: 60 }).notNull(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  backboneEquipmentId: uuid("backbone_equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  confidence: integer("confidence").default(100).notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("ftth_transparent_links_onu_mac_idx").on(table.onuId, table.macAddress)
]);
const tariffs = pgTable("tariffs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  serviceType: varchar("service_type", { length: 50 }).default("internet").notNull(),
  defaultNetPrice: numeric("default_net_price", { precision: 12, scale: 2 }).default("0").notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("23").notNull(),
  downloadMbps: integer("download_mbps"),
  uploadMbps: integer("upload_mbps"),
  queueName: varchar("queue_name", { length: 128 }),
  iptvPackageCode: varchar("iptv_package_code", { length: 128 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  tariffId: integer("tariff_id").references(() => tariffs.id, { onDelete: "restrict" }).notNull(),
  startDate: date("start_date").defaultNow().notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  billingPeriod: varchar("billing_period", { length: 30 }).default("monthly").notNull(),
  priceOverrideNet: numeric("price_override_net", { precision: 12, scale: 2 }),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  activationFee: numeric("activation_fee", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const diagnosticRuns = pgTable("diagnostic_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  driverCode: varchar("driver_code", { length: 60 }).notNull(),
  runType: varchar("run_type", { length: 60 }).notNull(),
  target: varchar("target", { length: 255 }),
  success: boolean("success").default(false).notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const netflowInterfaceSamples = pgTable("netflow_interface_samples", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  exporterAddress: varchar("exporter_address", { length: 45 }).notNull(),
  version: integer("version").notNull(),
  ifIndex: integer("if_index"),
  interfaceName: varchar("interface_name", { length: 128 }),
  role: varchar("role", { length: 32 }).default("unknown").notNull(),
  sourceInterface: varchar("source_interface", { length: 128 }),
  direction: varchar("direction", { length: 16 }).notNull(),
  bytes: doublePrecision("bytes").default(0).notNull(),
  packets: doublePrecision("packets").default(0).notNull(),
  records: doublePrecision("records").default(0).notNull(),
  bps: doublePrecision("bps").default(0).notNull(),
  speedBps: doublePrecision("speed_bps"),
  sampleWindowSeconds: doublePrecision("sample_window_seconds").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const netflowRawFlows = pgTable("netflow_raw_flows", {
  id: uuid("id").defaultRandom().primaryKey(),
  exporterAddress: varchar("exporter_address", { length: 45 }).notNull(),
  exporterPort: integer("exporter_port").notNull(),
  version: integer("version").notNull(),
  sourceId: integer("source_id").notNull(),
  sequence: doublePrecision("sequence").default(0).notNull(),
  exportedAt: timestamp("exported_at").notNull(),
  firstSeenAt: timestamp("first_seen_at"),
  lastSeenAt: timestamp("last_seen_at"),
  srcIp: varchar("src_ip", { length: 45 }),
  dstIp: varchar("dst_ip", { length: 45 }),
  srcPort: integer("src_port"),
  dstPort: integer("dst_port"),
  protocol: integer("protocol"),
  tcpFlags: integer("tcp_flags"),
  tos: integer("tos"),
  bytes: doublePrecision("bytes").default(0).notNull(),
  packets: doublePrecision("packets").default(0).notNull(),
  inputIfIndex: integer("input_if_index"),
  outputIfIndex: integer("output_if_index"),
  srcMac: varchar("src_mac", { length: 17 }),
  dstMac: varchar("dst_mac", { length: 17 }),
  natSrcIp: varchar("nat_src_ip", { length: 45 }),
  natDstIp: varchar("nat_dst_ip", { length: 45 }),
  natSrcPort: integer("nat_src_port"),
  natDstPort: integer("nat_dst_port"),
  flowDirection: varchar("flow_direction", { length: 16 }).default("unknown").notNull(),
  localIp: varchar("local_ip", { length: 45 }),
  remoteIp: varchar("remote_ip", { length: 45 }),
  userKey: varchar("user_key", { length: 160 }).default("unknown").notNull(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  confidence: varchar("confidence", { length: 32 }).default("unknown").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const netflowFlowRollups = pgTable("netflow_flow_rollups", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucket: timestamp("bucket").notNull(),
  bucketSeconds: integer("bucket_seconds").notNull(),
  exporterAddress: varchar("exporter_address", { length: 45 }).notNull(),
  scope: varchar("scope", { length: 32 }).notNull(),
  ifIndex: integer("if_index"),
  userKey: varchar("user_key", { length: 160 }),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  localIp: varchar("local_ip", { length: 45 }),
  direction: varchar("direction", { length: 16 }).notNull(),
  bytes: doublePrecision("bytes").default(0).notNull(),
  packets: doublePrecision("packets").default(0).notNull(),
  flows: doublePrecision("flows").default(0).notNull(),
  bps: doublePrecision("bps").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const netflowCollectorTemplates = pgTable("netflow_collector_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  exporterAddress: varchar("exporter_address", { length: 45 }).notNull(),
  version: integer("version").notNull(),
  sourceId: integer("source_id").notNull(),
  templateId: integer("template_id").notNull(),
  fields: jsonb("fields").$type().default([]).notNull(),
  refreshedAt: timestamp("refreshed_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()
});
const netflowExporterHealth = pgTable("netflow_exporter_health", {
  id: uuid("id").defaultRandom().primaryKey(),
  exporterAddress: varchar("exporter_address", { length: 45 }).notNull(),
  version: integer("version").notNull(),
  sourceId: integer("source_id").notNull(),
  packetCount: doublePrecision("packet_count").default(0).notNull(),
  flowRecords: doublePrecision("flow_records").default(0).notNull(),
  unknownTemplateRecords: doublePrecision("unknown_template_records").default(0).notNull(),
  sequenceGaps: doublePrecision("sequence_gaps").default(0).notNull(),
  templatesRefreshed: doublePrecision("templates_refreshed").default(0).notNull(),
  lastSequence: doublePrecision("last_sequence").default(0).notNull(),
  lastPacketAt: timestamp("last_packet_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const dhcpActiveUserSnapshots = pgTable("dhcp_active_user_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "cascade" }).notNull(),
  inventoryId: varchar("inventory_id", { length: 100 }).notNull(),
  totalLeases: integer("total_leases").default(0).notNull(),
  candidateLeases: integer("candidate_leases").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  joinedUsers: integer("joined_users").default(0).notNull(),
  leftUsers: integer("left_users").default(0).notNull(),
  activeKeys: jsonb("active_keys").$type().default([]).notNull(),
  evidenceCounts: jsonb("evidence_counts").$type().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const dhcpActiveUserScopeCounts = pgTable("dhcp_active_user_scope_counts", {
  id: uuid("id").defaultRandom().primaryKey(),
  snapshotId: uuid("snapshot_id").references(() => dhcpActiveUserSnapshots.id, { onDelete: "cascade" }).notNull(),
  scope: varchar("scope", { length: 32 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  count: integer("count").default(0).notNull()
});
const importRuns = pgTable("import_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  driverCode: varchar("driver_code", { length: 60 }).notNull(),
  importType: varchar("import_type", { length: 60 }).notNull(),
  mode: varchar("mode", { length: 30 }).default("preview").notNull(),
  success: boolean("success").default(false).notNull(),
  summary: jsonb("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const ipAddresses = pgTable("ip_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  networkId: uuid("network_id").references(() => ipNetworks.id, { onDelete: "set null" }),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  assignmentType: varchar("assignment_type", { length: 50 }).default("UNASSIGNED").notNull(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  importRunId: uuid("import_run_id").references(() => importRuns.id, { onDelete: "set null" }),
  source: varchar("source", { length: 80 }).default("manual").notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  notes: text()
}, (table) => [
  uniqueIndex("ip_addresses_network_ip_idx").on(table.networkId, table.ipAddress)
]);
const macAddresses = pgTable("mac_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  macAddress: varchar("mac_address", { length: 17 }).notNull().unique(),
  ownerType: varchar("owner_type", { length: 50 }).default("UNKNOWN").notNull(),
  customerDeviceId: uuid("customer_device_id").references(() => customerDevices.id, { onDelete: "set null" }),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  importRunId: uuid("import_run_id").references(() => importRuns.id, { onDelete: "set null" }),
  source: varchar("source", { length: 80 }).default("manual").notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull()
});
const accessProfileDeviceBindings = pgTable("access_profile_device_bindings", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => accessProfiles.id, { onDelete: "cascade" }).notNull(),
  modelId: integer("model_id").references(() => deviceModels.id, { onDelete: "cascade" }),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "cascade" }),
  managementProtocol: varchar("management_protocol", { length: 30 }).default("ssh").notNull(),
  configTemplate: text("config_template"),
  configPayload: jsonb("config_payload"),
  priority: integer("priority").default(100).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("access_profile_bindings_profile_model_idx").on(table.profileId, table.modelId),
  uniqueIndex("access_profile_bindings_profile_equipment_idx").on(table.profileId, table.equipmentId),
  check("access_profile_device_bindings_target_check", sql`${table.modelId} is not null or ${table.equipmentId} is not null`)
]);
const automationScripts = pgTable("automation_scripts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  scope: varchar("scope", { length: 50 }).default("DEVICE").notNull(),
  triggerType: varchar("trigger_type", { length: 50 }).default("MANUAL").notNull(),
  scriptLanguage: varchar("script_language", { length: 50 }).default("bash").notNull(),
  scriptBody: text("script_body").notNull(),
  profileId: integer("profile_id").references(() => accessProfiles.id, { onDelete: "set null" }),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  timeoutSeconds: integer("timeout_seconds").default(60).notNull(),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const automationVariableDefinitions = pgTable("automation_variable_definitions", {
  id: serial("id").primaryKey(),
  variableName: varchar("variable_name", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 160 }),
  valueType: varchar("value_type", { length: 30 }).default("string").notNull(),
  sourceType: varchar("source_type", { length: 30 }).default("DATABASE").notNull(),
  tableName: varchar("table_name", { length: 80 }),
  rowLookupColumn: varchar("row_lookup_column", { length: 80 }),
  rowLookupValue: varchar("row_lookup_value", { length: 255 }),
  fieldName: varchar("field_name", { length: 80 }),
  staticValue: text("static_value"),
  fallbackValue: text("fallback_value"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const authGroups = pgTable("auth_groups", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  permissions: jsonb("permissions").$type().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const authUsers = pgTable("auth_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 120 }).notNull().unique(),
  displayName: varchar("display_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }),
  passwordHash: text("password_hash").notNull(),
  groupId: integer("group_id").references(() => authGroups.id, { onDelete: "restrict" }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  customerType: varchar("customer_type", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  pesel: varchar("pesel", { length: 11 }).unique(),
  identityDocumentNumber: varchar("identity_document_number", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }).unique(),
  regon: varchar("regon", { length: 14 }).unique(),
  krs: varchar("krs", { length: 20 }),
  representativeName: varchar("representative_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  billingTerytAreaId: integer("billing_teryt_area_id").references(() => terytAreas.id, { onDelete: "set null" }),
  billingSimcLocalityId: integer("billing_simc_locality_id").references(() => simcLocalities.id, { onDelete: "set null" }),
  billingStreetId: integer("billing_street_id").references(() => ulicStreets.id, { onDelete: "set null" }),
  billingBuildingNumber: varchar("billing_building_number", { length: 30 }),
  billingApartmentNumber: varchar("billing_apartment_number", { length: 30 }),
  billingAddress: text("billing_address"),
  importExternalId: varchar("import_external_id", { length: 80 }),
  importIssues: jsonb("import_issues").$type().default([]).notNull(),
  archivedAt: timestamp("archived_at"),
  archiveReason: text("archive_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const customerServices = pgTable("customer_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  profileId: integer("profile_id").references(() => accessProfiles.id, { onDelete: "restrict" }).notNull(),
  equipmentId: uuid("equipment_id").references(() => networkEquipment.id, { onDelete: "set null" }).unique(),
  serviceTerytAreaId: integer("service_teryt_area_id").references(() => terytAreas.id, { onDelete: "set null" }),
  serviceSimcLocalityId: integer("service_simc_locality_id").references(() => simcLocalities.id, { onDelete: "set null" }),
  serviceStreetId: integer("service_street_id").references(() => ulicStreets.id, { onDelete: "set null" }),
  serviceBuildingNumber: varchar("service_building_number", { length: 30 }),
  serviceApartmentNumber: varchar("service_apartment_number", { length: 30 }),
  activationDate: timestamp("activation_date"),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  importIssues: jsonb("import_issues").$type().default([]).notNull(),
  archivedAt: timestamp("archived_at"),
  archiveReason: text("archive_reason")
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accessProfileDeviceBindings: accessProfileDeviceBindings,
  accessProfiles: accessProfiles,
  authGroups: authGroups,
  authUsers: authUsers,
  automationScripts: automationScripts,
  automationVariableDefinitions: automationVariableDefinitions,
  customerDevices: customerDevices,
  customerServices: customerServices,
  customers: customers,
  deviceModels: deviceModels,
  deviceTypes: deviceTypes,
  dhcpActiveUserScopeCounts: dhcpActiveUserScopeCounts,
  dhcpActiveUserSnapshots: dhcpActiveUserSnapshots,
  diagnosticRuns: diagnosticRuns,
  ftthOlts: ftthOlts,
  ftthOnuIpHosts: ftthOnuIpHosts,
  ftthOnuMacs: ftthOnuMacs,
  ftthOnus: ftthOnus,
  ftthPonPorts: ftthPonPorts,
  ftthTransparentLinks: ftthTransparentLinks,
  importRuns: importRuns,
  ipAddresses: ipAddresses,
  ipNetworks: ipNetworks,
  macAddresses: macAddresses,
  managementDrivers: managementDrivers,
  netflowCollectorTemplates: netflowCollectorTemplates,
  netflowExporterHealth: netflowExporterHealth,
  netflowFlowRollups: netflowFlowRollups,
  netflowInterfaceSamples: netflowInterfaceSamples,
  netflowRawFlows: netflowRawFlows,
  networkEquipment: networkEquipment,
  networkLines: networkLines,
  networkNodes: networkNodes,
  simcLocalities: simcLocalities,
  subscriptions: subscriptions,
  tariffs: tariffs,
  terytAreas: terytAreas,
  ukeMediumTypes: ukeMediumTypes,
  ukeTechnologyTypes: ukeTechnologyTypes,
  ulicStreets: ulicStreets
}, Symbol.toStringTag, { value: 'Module' }));

const ukeMediumTypesRelations = relations$1(ukeMediumTypes, ({ many }) => ({
  nodes: many(networkNodes),
  lines: many(networkLines)
}));
const ukeTechnologyTypesRelations = relations$1(ukeTechnologyTypes, ({ many }) => ({
  models: many(deviceModels),
  accessProfiles: many(accessProfiles)
}));
const terytAreasRelations = relations$1(terytAreas, ({ many }) => ({
  localities: many(simcLocalities),
  nodes: many(networkNodes),
  services: many(customerServices)
}));
const simcLocalitiesRelations = relations$1(simcLocalities, ({ one, many }) => ({
  terytArea: one(terytAreas, {
    fields: [simcLocalities.terytAreaId],
    references: [terytAreas.id]
  }),
  streets: many(ulicStreets),
  nodes: many(networkNodes),
  services: many(customerServices)
}));
const ulicStreetsRelations = relations$1(ulicStreets, ({ one, many }) => ({
  locality: one(simcLocalities, {
    fields: [ulicStreets.simcLocalityId],
    references: [simcLocalities.id]
  }),
  nodes: many(networkNodes),
  services: many(customerServices)
}));
const deviceTypesRelations = relations$1(deviceTypes, ({ many }) => ({
  models: many(deviceModels)
}));
const deviceModelsRelations = relations$1(deviceModels, ({ one, many }) => ({
  type: one(deviceTypes, {
    fields: [deviceModels.typeId],
    references: [deviceTypes.id]
  }),
  technology: one(ukeTechnologyTypes, {
    fields: [deviceModels.technologyTypeId],
    references: [ukeTechnologyTypes.id]
  }),
  equipment: many(networkEquipment),
  profileBindings: many(accessProfileDeviceBindings)
}));
const accessProfilesRelations = relations$1(accessProfiles, ({ one, many }) => ({
  technology: one(ukeTechnologyTypes, {
    fields: [accessProfiles.technologyTypeId],
    references: [ukeTechnologyTypes.id]
  }),
  equipment: many(networkEquipment),
  deviceBindings: many(accessProfileDeviceBindings),
  automationScripts: many(automationScripts)
}));
const managementDriversRelations = relations$1(managementDrivers, ({ many }) => ({
  equipment: many(networkEquipment)
}));
const networkNodesRelations = relations$1(networkNodes, ({ one, many }) => ({
  medium: one(ukeMediumTypes, {
    fields: [networkNodes.mediumTypeId],
    references: [ukeMediumTypes.id]
  }),
  terytArea: one(terytAreas, {
    fields: [networkNodes.terytAreaId],
    references: [terytAreas.id]
  }),
  simcLocality: one(simcLocalities, {
    fields: [networkNodes.simcLocalityId],
    references: [simcLocalities.id]
  }),
  street: one(ulicStreets, {
    fields: [networkNodes.streetId],
    references: [ulicStreets.id]
  }),
  startingLines: many(networkLines, { relationName: "startNode" }),
  endingLines: many(networkLines, { relationName: "endNode" }),
  equipment: many(networkEquipment),
  ipNetworks: many(ipNetworks)
}));
const networkLinesRelations = relations$1(networkLines, ({ one }) => ({
  startNode: one(networkNodes, {
    fields: [networkLines.nodeStartId],
    references: [networkNodes.id],
    relationName: "startNode"
  }),
  endNode: one(networkNodes, {
    fields: [networkLines.nodeEndId],
    references: [networkNodes.id],
    relationName: "endNode"
  }),
  medium: one(ukeMediumTypes, {
    fields: [networkLines.mediumTypeId],
    references: [ukeMediumTypes.id]
  })
}));
const networkEquipmentRelations = relations$1(networkEquipment, ({ one, many }) => ({
  model: one(deviceModels, {
    fields: [networkEquipment.modelId],
    references: [deviceModels.id]
  }),
  node: one(networkNodes, {
    fields: [networkEquipment.nodeId],
    references: [networkNodes.id]
  }),
  accessProfile: one(accessProfiles, {
    fields: [networkEquipment.accessProfileId],
    references: [accessProfiles.id]
  }),
  managementDriver: one(managementDrivers, {
    fields: [networkEquipment.managementDriverId],
    references: [managementDrivers.id]
  }),
  parentEquipment: one(networkEquipment, {
    fields: [networkEquipment.parentEquipmentId],
    references: [networkEquipment.id],
    relationName: "equipmentParent"
  }),
  childEquipment: many(networkEquipment, { relationName: "equipmentParent" }),
  service: one(customerServices, {
    fields: [networkEquipment.id],
    references: [customerServices.equipmentId]
  }),
  customerDevices: many(customerDevices, { relationName: "customerDeviceBackbone" }),
  onuCustomerDevices: many(customerDevices, { relationName: "customerDeviceOnu" }),
  profileBindings: many(accessProfileDeviceBindings),
  automationScripts: many(automationScripts),
  diagnosticRuns: many(diagnosticRuns),
  importRuns: many(importRuns),
  ownedIpNetworks: many(ipNetworks),
  ipAddresses: many(ipAddresses),
  macAddresses: many(macAddresses),
  ftthOlt: one(ftthOlts, {
    fields: [networkEquipment.id],
    references: [ftthOlts.networkEquipmentId]
  }),
  ftthOnus: many(ftthOnus),
  transparentBackboneLinks: many(ftthTransparentLinks)
}));
const ipNetworksRelations = relations$1(ipNetworks, ({ one, many }) => ({
  ownerNode: one(networkNodes, {
    fields: [ipNetworks.ownerNodeId],
    references: [networkNodes.id]
  }),
  ownerEquipment: one(networkEquipment, {
    fields: [ipNetworks.ownerEquipmentId],
    references: [networkEquipment.id]
  }),
  addresses: many(ipAddresses)
}));
const ftthOltsRelations = relations$1(ftthOlts, ({ one, many }) => ({
  equipment: one(networkEquipment, {
    fields: [ftthOlts.networkEquipmentId],
    references: [networkEquipment.id]
  }),
  ponPorts: many(ftthPonPorts)
}));
const ftthPonPortsRelations = relations$1(ftthPonPorts, ({ one, many }) => ({
  olt: one(ftthOlts, {
    fields: [ftthPonPorts.oltId],
    references: [ftthOlts.id]
  }),
  onus: many(ftthOnus)
}));
const ftthOnusRelations = relations$1(ftthOnus, ({ one, many }) => ({
  ponPort: one(ftthPonPorts, {
    fields: [ftthOnus.ponPortId],
    references: [ftthPonPorts.id]
  }),
  equipment: one(networkEquipment, {
    fields: [ftthOnus.networkEquipmentId],
    references: [networkEquipment.id]
  }),
  ipHosts: many(ftthOnuIpHosts),
  macs: many(ftthOnuMacs),
  transparentLinks: many(ftthTransparentLinks),
  customerDevices: many(customerDevices)
}));
const ftthOnuIpHostsRelations = relations$1(ftthOnuIpHosts, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthOnuIpHosts.onuId],
    references: [ftthOnus.id]
  })
}));
const ftthOnuMacsRelations = relations$1(ftthOnuMacs, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthOnuMacs.onuId],
    references: [ftthOnus.id]
  })
}));
const accessProfileDeviceBindingsRelations = relations$1(accessProfileDeviceBindings, ({ one }) => ({
  profile: one(accessProfiles, {
    fields: [accessProfileDeviceBindings.profileId],
    references: [accessProfiles.id]
  }),
  model: one(deviceModels, {
    fields: [accessProfileDeviceBindings.modelId],
    references: [deviceModels.id]
  }),
  equipment: one(networkEquipment, {
    fields: [accessProfileDeviceBindings.equipmentId],
    references: [networkEquipment.id]
  })
}));
const automationScriptsRelations = relations$1(automationScripts, ({ one }) => ({
  profile: one(accessProfiles, {
    fields: [automationScripts.profileId],
    references: [accessProfiles.id]
  }),
  equipment: one(networkEquipment, {
    fields: [automationScripts.equipmentId],
    references: [networkEquipment.id]
  })
}));
const customersRelations = relations$1(customers, ({ one, many }) => ({
  services: many(customerServices),
  customerDevices: many(customerDevices),
  subscriptions: many(subscriptions),
  billingTerytArea: one(terytAreas, {
    fields: [customers.billingTerytAreaId],
    references: [terytAreas.id]
  }),
  billingSimcLocality: one(simcLocalities, {
    fields: [customers.billingSimcLocalityId],
    references: [simcLocalities.id]
  }),
  billingStreet: one(ulicStreets, {
    fields: [customers.billingStreetId],
    references: [ulicStreets.id]
  })
}));
const customerDevicesRelations = relations$1(customerDevices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [customerDevices.customerId],
    references: [customers.id]
  }),
  equipment: one(networkEquipment, {
    fields: [customerDevices.equipmentId],
    references: [networkEquipment.id],
    relationName: "customerDeviceBackbone"
  }),
  onuEquipment: one(networkEquipment, {
    fields: [customerDevices.onuEquipmentId],
    references: [networkEquipment.id],
    relationName: "customerDeviceOnu"
  }),
  ftthOnu: one(ftthOnus, {
    fields: [customerDevices.ftthOnuId],
    references: [ftthOnus.id]
  }),
  subscriptions: many(subscriptions),
  diagnosticRuns: many(diagnosticRuns),
  ipAddresses: many(ipAddresses),
  macAddresses: many(macAddresses),
  transparentLinks: many(ftthTransparentLinks)
}));
const ftthTransparentLinksRelations = relations$1(ftthTransparentLinks, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthTransparentLinks.onuId],
    references: [ftthOnus.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [ftthTransparentLinks.customerDeviceId],
    references: [customerDevices.id]
  }),
  backboneEquipment: one(networkEquipment, {
    fields: [ftthTransparentLinks.backboneEquipmentId],
    references: [networkEquipment.id]
  })
}));
const tariffsRelations = relations$1(tariffs, ({ many }) => ({
  subscriptions: many(subscriptions)
}));
const subscriptionsRelations = relations$1(subscriptions, ({ one }) => ({
  customer: one(customers, {
    fields: [subscriptions.customerId],
    references: [customers.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [subscriptions.customerDeviceId],
    references: [customerDevices.id]
  }),
  tariff: one(tariffs, {
    fields: [subscriptions.tariffId],
    references: [tariffs.id]
  })
}));
const customerServicesRelations = relations$1(customerServices, ({ one }) => ({
  customer: one(customers, {
    fields: [customerServices.customerId],
    references: [customers.id]
  }),
  profile: one(accessProfiles, {
    fields: [customerServices.profileId],
    references: [accessProfiles.id]
  }),
  equipment: one(networkEquipment, {
    fields: [customerServices.equipmentId],
    references: [networkEquipment.id]
  }),
  serviceTerytArea: one(terytAreas, {
    fields: [customerServices.serviceTerytAreaId],
    references: [terytAreas.id]
  }),
  serviceSimcLocality: one(simcLocalities, {
    fields: [customerServices.serviceSimcLocalityId],
    references: [simcLocalities.id]
  }),
  serviceStreet: one(ulicStreets, {
    fields: [customerServices.serviceStreetId],
    references: [ulicStreets.id]
  })
}));
const diagnosticRunsRelations = relations$1(diagnosticRuns, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [diagnosticRuns.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [diagnosticRuns.equipmentId],
    references: [networkEquipment.id]
  })
}));
const importRunsRelations = relations$1(importRuns, ({ one }) => ({
  equipment: one(networkEquipment, {
    fields: [importRuns.equipmentId],
    references: [networkEquipment.id]
  })
}));
const ipAddressesRelations = relations$1(ipAddresses, ({ one }) => ({
  network: one(ipNetworks, {
    fields: [ipAddresses.networkId],
    references: [ipNetworks.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [ipAddresses.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [ipAddresses.equipmentId],
    references: [networkEquipment.id]
  }),
  importRun: one(importRuns, {
    fields: [ipAddresses.importRunId],
    references: [importRuns.id]
  })
}));
const macAddressesRelations = relations$1(macAddresses, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [macAddresses.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [macAddresses.equipmentId],
    references: [networkEquipment.id]
  }),
  importRun: one(importRuns, {
    fields: [macAddresses.importRunId],
    references: [importRuns.id]
  })
}));

const relations = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  accessProfileDeviceBindingsRelations: accessProfileDeviceBindingsRelations,
  accessProfilesRelations: accessProfilesRelations,
  automationScriptsRelations: automationScriptsRelations,
  customerDevicesRelations: customerDevicesRelations,
  customerServicesRelations: customerServicesRelations,
  customersRelations: customersRelations,
  deviceModelsRelations: deviceModelsRelations,
  deviceTypesRelations: deviceTypesRelations,
  diagnosticRunsRelations: diagnosticRunsRelations,
  ftthOltsRelations: ftthOltsRelations,
  ftthOnuIpHostsRelations: ftthOnuIpHostsRelations,
  ftthOnuMacsRelations: ftthOnuMacsRelations,
  ftthOnusRelations: ftthOnusRelations,
  ftthPonPortsRelations: ftthPonPortsRelations,
  ftthTransparentLinksRelations: ftthTransparentLinksRelations,
  importRunsRelations: importRunsRelations,
  ipAddressesRelations: ipAddressesRelations,
  ipNetworksRelations: ipNetworksRelations,
  macAddressesRelations: macAddressesRelations,
  managementDriversRelations: managementDriversRelations,
  networkEquipmentRelations: networkEquipmentRelations,
  networkLinesRelations: networkLinesRelations,
  networkNodesRelations: networkNodesRelations,
  simcLocalitiesRelations: simcLocalitiesRelations,
  subscriptionsRelations: subscriptionsRelations,
  tariffsRelations: tariffsRelations,
  terytAreasRelations: terytAreasRelations,
  ukeMediumTypesRelations: ukeMediumTypesRelations,
  ukeTechnologyTypesRelations: ukeTechnologyTypesRelations,
  ulicStreetsRelations: ulicStreetsRelations
}, Symbol.toStringTag, { value: 'Module' }));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set. Database-backed API routes will fail until it is configured.");
}
const pool = new Pool({
  connectionString,
  // Increase pool size for handling concurrent requests
  max: 20,
  // Keep minimum connections warm
  min: 5,
  // Timeout waiting for a connection from the pool
  connectionTimeoutMillis: 2e3,
  // Timeout for idle connections before closing
  idleTimeoutMillis: 3e4
});
const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations
  }
});

const automationSourceCatalog = {
  network_equipment: {
    label: "Urz\u0105dzenia",
    lookupColumns: ["id", "inventoryId", "hostname", "managementIp", "macAddress", "serialNumber"],
    fields: ["id", "inventoryId", "hostname", "managementIp", "managementPort", "managementProtocol", "macAddress", "serialNumber", "equipmentRole", "bridgeMode", "onuPort", "onuId", "status"]
  },
  customers: {
    label: "Klienci",
    lookupColumns: ["id", "fullName", "taxId", "contactEmail", "contactPhone"],
    fields: ["id", "fullName", "customerType", "firstName", "lastName", "companyName", "taxId", "contactEmail", "contactPhone"]
  },
  customer_services: {
    label: "Us\u0142ugi klient\xF3w",
    lookupColumns: ["id", "customerId", "equipmentId"],
    fields: ["id", "customerId", "profileId", "equipmentId", "serviceBuildingNumber", "serviceApartmentNumber", "status"]
  },
  access_profiles: {
    label: "Profile zarz\u0105dzania",
    lookupColumns: ["id", "name"],
    fields: ["id", "name", "defaultProtocol", "defaultPort", "username", "apiBaseUrl", "isActive"]
  },
  management_drivers: {
    label: "Drivery zarz\u0105dzania",
    lookupColumns: ["id", "code", "label"],
    fields: ["id", "code", "label", "transport", "isActive"]
  },
  customer_devices: {
    label: "Urz\u0105dzenia klienta",
    lookupColumns: ["id", "hostname", "ipAddress", "macAddress"],
    fields: ["id", "customerId", "equipmentId", "onuEquipmentId", "hostname", "ipAddress", "macAddress", "status", "dhcpServer", "dhcpInterface", "oltPort", "onuId"]
  },
  tariffs: {
    label: "Taryfy",
    lookupColumns: ["id", "name", "queueName", "iptvPackageCode"],
    fields: ["id", "name", "serviceType", "defaultNetPrice", "vatRate", "downloadMbps", "uploadMbps", "queueName", "iptvPackageCode", "isActive"]
  },
  subscriptions: {
    label: "Subskrypcje",
    lookupColumns: ["id", "customerId", "customerDeviceId"],
    fields: ["id", "customerId", "customerDeviceId", "tariffId", "status", "billingPeriod", "priceOverrideNet"]
  },
  diagnostic_runs: {
    label: "Wyniki diagnostyki",
    lookupColumns: ["id", "customerDeviceId", "driverCode", "runType"],
    fields: ["id", "customerDeviceId", "equipmentId", "driverCode", "runType", "target", "success", "createdAt"]
  },
  import_runs: {
    label: "Wyniki import\xF3w",
    lookupColumns: ["id", "equipmentId", "driverCode", "importType"],
    fields: ["id", "equipmentId", "driverCode", "importType", "mode", "success", "createdAt"]
  },
  automation_scripts: {
    label: "Skrypty automatyzacji",
    lookupColumns: ["id", "name"],
    fields: ["id", "name", "scope", "triggerType", "scriptLanguage", "timeoutSeconds"]
  }
};
function isSourceTable(value) {
  return !!value && value in automationSourceCatalog;
}
function getRecordValue(record, fieldName) {
  if (!record || !fieldName) return void 0;
  return record[fieldName];
}
async function resolveSourceRow(definition) {
  const tableName = definition.tableName;
  const lookupColumn = definition.rowLookupColumn;
  const lookupValue = definition.rowLookupValue;
  if (!isSourceTable(tableName) || !lookupColumn || !lookupValue) return void 0;
  switch (tableName) {
    case "network_equipment":
      if (lookupColumn === "id") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, lookupValue) });
      if (lookupColumn === "inventoryId") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, lookupValue) });
      if (lookupColumn === "hostname") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.hostname, lookupValue) });
      if (lookupColumn === "managementIp") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.managementIp, lookupValue) });
      if (lookupColumn === "macAddress") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.macAddress, lookupValue) });
      if (lookupColumn === "serialNumber") return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.serialNumber, lookupValue) });
      return void 0;
    case "customers":
      if (lookupColumn === "id") return db.query.customers.findFirst({ where: eq(customers.id, lookupValue) });
      if (lookupColumn === "fullName") return db.query.customers.findFirst({ where: eq(customers.fullName, lookupValue) });
      if (lookupColumn === "taxId") return db.query.customers.findFirst({ where: eq(customers.taxId, lookupValue) });
      if (lookupColumn === "contactEmail") return db.query.customers.findFirst({ where: eq(customers.contactEmail, lookupValue) });
      if (lookupColumn === "contactPhone") return db.query.customers.findFirst({ where: eq(customers.contactPhone, lookupValue) });
      return void 0;
    case "customer_services":
      if (lookupColumn === "id") return db.query.customerServices.findFirst({ where: eq(customerServices.id, lookupValue) });
      if (lookupColumn === "customerId") return db.query.customerServices.findFirst({ where: eq(customerServices.customerId, lookupValue) });
      if (lookupColumn === "equipmentId") return db.query.customerServices.findFirst({ where: eq(customerServices.equipmentId, lookupValue) });
      return void 0;
    case "access_profiles":
      if (lookupColumn === "id") return db.query.accessProfiles.findFirst({ where: eq(accessProfiles.id, Number(lookupValue)) });
      if (lookupColumn === "name") return db.query.accessProfiles.findFirst({ where: eq(accessProfiles.name, lookupValue) });
      return void 0;
    case "management_drivers":
      if (lookupColumn === "id") return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.id, Number(lookupValue)) });
      if (lookupColumn === "code") return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, lookupValue) });
      if (lookupColumn === "label") return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.label, lookupValue) });
      return void 0;
    case "customer_devices":
      if (lookupColumn === "id") return db.query.customerDevices.findFirst({ where: eq(customerDevices.id, lookupValue) });
      if (lookupColumn === "hostname") return db.query.customerDevices.findFirst({ where: eq(customerDevices.hostname, lookupValue) });
      if (lookupColumn === "ipAddress") return db.query.customerDevices.findFirst({ where: eq(customerDevices.ipAddress, lookupValue) });
      if (lookupColumn === "macAddress") return db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, lookupValue) });
      return void 0;
    case "tariffs":
      if (lookupColumn === "id") return db.query.tariffs.findFirst({ where: eq(tariffs.id, Number(lookupValue)) });
      if (lookupColumn === "name") return db.query.tariffs.findFirst({ where: eq(tariffs.name, lookupValue) });
      if (lookupColumn === "queueName") return db.query.tariffs.findFirst({ where: eq(tariffs.queueName, lookupValue) });
      if (lookupColumn === "iptvPackageCode") return db.query.tariffs.findFirst({ where: eq(tariffs.iptvPackageCode, lookupValue) });
      return void 0;
    case "subscriptions":
      if (lookupColumn === "id") return db.query.subscriptions.findFirst({ where: eq(subscriptions.id, lookupValue) });
      if (lookupColumn === "customerId") return db.query.subscriptions.findFirst({ where: eq(subscriptions.customerId, lookupValue) });
      if (lookupColumn === "customerDeviceId") return db.query.subscriptions.findFirst({ where: eq(subscriptions.customerDeviceId, lookupValue) });
      return void 0;
    case "diagnostic_runs":
      if (lookupColumn === "id") return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.id, lookupValue) });
      if (lookupColumn === "customerDeviceId") return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.customerDeviceId, lookupValue) });
      if (lookupColumn === "driverCode") return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.driverCode, lookupValue) });
      if (lookupColumn === "runType") return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.runType, lookupValue) });
      return void 0;
    case "import_runs":
      if (lookupColumn === "id") return db.query.importRuns.findFirst({ where: eq(importRuns.id, lookupValue) });
      if (lookupColumn === "equipmentId") return db.query.importRuns.findFirst({ where: eq(importRuns.equipmentId, lookupValue) });
      if (lookupColumn === "driverCode") return db.query.importRuns.findFirst({ where: eq(importRuns.driverCode, lookupValue) });
      if (lookupColumn === "importType") return db.query.importRuns.findFirst({ where: eq(importRuns.importType, lookupValue) });
      return void 0;
    case "automation_scripts":
      if (lookupColumn === "id") return db.query.automationScripts.findFirst({ where: eq(automationScripts.id, Number(lookupValue)) });
      if (lookupColumn === "name") return db.query.automationScripts.findFirst({ where: eq(automationScripts.name, lookupValue) });
      return void 0;
  }
}
async function resolveAutomationVariables(overrides = {}) {
  var _a;
  const definitions = await db.query.automationVariableDefinitions.findMany({
    where: eq(automationVariableDefinitions.isActive, true),
    orderBy: (table, { asc }) => [asc(table.variableName)]
  });
  const values = {};
  for (const definition of definitions) {
    if (definition.variableName in overrides) {
      values[definition.variableName] = (_a = overrides[definition.variableName]) != null ? _a : "";
      continue;
    }
    if (definition.sourceType === "STATIC") {
      values[definition.variableName] = formatVariableValue(definition, definition.staticValue);
      continue;
    }
    const row = await resolveSourceRow(definition);
    const rawValue = getRecordValue(row, definition.fieldName);
    values[definition.variableName] = formatVariableValue(definition, rawValue);
  }
  return values;
}
function formatVariableValue(definition, rawValue) {
  var _a;
  const fallback = (_a = definition.fallbackValue) != null ? _a : "";
  if (rawValue == null || rawValue === "") return fallback;
  if (definition.valueType === "int") {
    const numericValue = Number.parseInt(String(rawValue), 10);
    return Number.isNaN(numericValue) ? fallback : String(numericValue);
  }
  if (definition.valueType === "date") {
    const date = new Date(String(rawValue));
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10);
  }
  if (definition.valueType === "bool") {
    return ["1", "true", "tak", "yes", "on"].includes(String(rawValue).trim().toLowerCase()) ? "true" : "false";
  }
  return String(rawValue);
}
function renderAutomationTemplate(template, variables) {
  const renderedConditionBlocks = template.replace(/\{\{#if\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*=\s*([^}]+?))?\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, variableName, expectedValue, body) => shouldRenderConditional(variableName, expectedValue, variables) ? body : "").replace(/if\s+\$([A-Za-z_][A-Za-z0-9_]*)(?:\s*=\s*([^\]\s]+))?\s*\[\s*([\s\S]*?)\s*\]/g, (_match, variableName, expectedValue, body) => shouldRenderConditional(variableName, expectedValue, variables) ? body : "");
  return renderedConditionBlocks.replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, variableName) => {
    var _a;
    return (_a = variables[variableName]) != null ? _a : "";
  });
}
function shouldRenderConditional(variableName, expectedValue, variables) {
  var _a;
  const actualValue = (_a = variables[variableName]) != null ? _a : "";
  if (expectedValue == null) {
    return ["1", "true", "tak", "yes", "on"].includes(actualValue.trim().toLowerCase());
  }
  return actualValue.trim().toLowerCase() === expectedValue.trim().replace(/^["']|["']$/g, "").toLowerCase();
}
async function renderAutomationScript(scriptId, overrides = {}) {
  const script = await db.query.automationScripts.findFirst({
    where: eq(automationScripts.id, scriptId)
  });
  if (!script) {
    throw createError$1({ statusCode: 404, statusMessage: "Script not found" });
  }
  const variables = await resolveAutomationVariables(overrides);
  return {
    script,
    variables,
    renderedBody: renderAutomationTemplate(script.scriptBody, variables)
  };
}

function parseExecutionData(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
function commandForScript(script, tempFilePath) {
  if (script.scriptLanguage === "typescript" || script.scriptLanguage === "tsx") {
    if (!tempFilePath) throw new Error("Brak pliku tymczasowego dla skryptu TypeScript");
    return { command: "pnpm", args: ["exec", "tsx", tempFilePath] };
  }
  if (script.scriptLanguage === "bash") {
    return { command: "bash", args: ["-lc", script.scriptBody] };
  }
  throw new Error(`Nieobs\u0142ugiwany j\u0119zyk skryptu: ${script.scriptLanguage}`);
}
async function executeAutomationScript(script) {
  const cwd = process.cwd();
  const tempFilePath = script.scriptLanguage === "typescript" || script.scriptLanguage === "tsx" ? join(cwd, `.netcoreops-automation-${script.id}-${Date.now()}.ts`) : void 0;
  if (tempFilePath) {
    await writeFile$1(tempFilePath, script.scriptBody, "utf8");
  }
  const { command, args } = commandForScript(script, tempFilePath);
  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        NETCOREOPS_AUTOMATION_SCRIPT_ID: String(script.id),
        NETCOREOPS_AUTOMATION_SCRIPT_NAME: script.name,
        NETCOREOPS_AUTOMATION_EQUIPMENT_ID: script.equipmentId || ""
      },
      shell: false
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
    }, script.timeoutSeconds * 1e3);
    child.stdout.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));
    child.on("close", async (exitCode) => {
      clearTimeout(timeout);
      if (tempFilePath) await rm(tempFilePath, { force: true }).catch(() => void 0);
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");
      resolve({
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        data: parseExecutionData(stdout)
      });
    });
  });
}

function escapeCsvValue(value) {
  if (value === null || value === void 0) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}
function toCsv(rows, headers) {
  return [
    headers.map((header) => escapeCsvValue(header)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))
  ].join("\n");
}

function summarizeCheck(check) {
  if (check.message) return check.message;
  if (Array.isArray(check.data)) return check.data.length ? `${check.data.length} znalezionych wpis\xF3w` : "Brak wpis\xF3w";
  if (check.data && typeof check.data === "object") return "Odpowied\u017A zawiera dane";
  return check.status === "ok" ? "Operacja zako\u0144czona poprawnie" : "Brak danych";
}
function recommendationFor(check) {
  if (check.status === "ok") return "Nie wymaga dzia\u0142ania";
  if (check.status === "unsupported") return "Ten driver nie obs\u0142uguje tej operacji";
  if (check.status === "warning") return "Sprawd\u017A konfiguracj\u0119 urz\u0105dzenia i dane wej\u015Bciowe";
  return "Sprawd\u017A dost\u0119p do urz\u0105dzenia, po\u015Bwiadczenia i parametry testu";
}
function overallRecommendation(rows) {
  if (!rows.length) return "Uruchom test lub wybierz dane wej\u015Bciowe";
  const actionable = rows.find((row) => row.status !== "ok");
  return (actionable == null ? void 0 : actionable.recommendation) || "Nie wymaga dzia\u0142ania";
}
function presentDiagnostics(input) {
  var _a;
  const statuses = input.checks.map((check) => check.status);
  const status = statuses.includes("ok") ? "ok" : statuses.includes("warning") ? "warning" : statuses.includes("error") ? "error" : "unsupported";
  const rows = input.checks.map((check) => {
    var _a2, _b;
    return {
      name: check.name,
      status: check.status,
      summary: summarizeCheck(check),
      recommendation: recommendationFor(check),
      details: (_b = (_a2 = check.data) != null ? _a2 : check.message) != null ? _b : null
    };
  });
  return {
    status,
    title: input.title,
    target: typeof input.target === "string" ? input.target : input.target ? Object.values(input.target).filter(Boolean).join(" / ") : "Brak celu",
    recommendation: overallRecommendation(rows),
    rows,
    raw: (_a = input.raw) != null ? _a : input.checks
  };
}
function withDiagnosticPresentation(title, data) {
  var _a;
  const checks = ((_a = data.checks) == null ? void 0 : _a.length) ? data.checks : data.commandTree ? [data.commandTree] : [];
  return {
    ...data,
    presentation: presentDiagnostics({
      title,
      target: data.target,
      checks,
      raw: data
    })
  };
}

async function resolveMediumTypeId(code) {
  var _a;
  if (!code) return null;
  const medium = await db.query.ukeMediumTypes.findFirst({ where: eq(ukeMediumTypes.code, code) });
  return (_a = medium == null ? void 0 : medium.id) != null ? _a : null;
}
async function resolveAddressIds(address) {
  var _a, _b, _c;
  if (!address) {
    return {
      terytAreaId: null,
      simcLocalityId: null,
      streetId: null
    };
  }
  const area = await db.query.terytAreas.findFirst({ where: eq(terytAreas.terytCode, address.terytCode) });
  const locality = await db.query.simcLocalities.findFirst({ where: eq(simcLocalities.simcCode, address.simcCode) });
  const street = address.ulicCode && locality ? await db.query.ulicStreets.findFirst({
    where: and(eq(ulicStreets.simcLocalityId, locality.id), eq(ulicStreets.ulicCode, address.ulicCode))
  }) : null;
  return {
    terytAreaId: (_a = area == null ? void 0 : area.id) != null ? _a : null,
    simcLocalityId: (_b = locality == null ? void 0 : locality.id) != null ? _b : null,
    streetId: (_c = street == null ? void 0 : street.id) != null ? _c : null
  };
}
async function searchAddresses(term) {
  const pattern = `%${term}%`;
  const streets = await db.query.ulicStreets.findMany({
    where: or(ilike(ulicStreets.name, pattern), ilike(ulicStreets.ulicCode, pattern)),
    with: {
      locality: {
        with: {
          terytArea: true
        }
      }
    },
    limit: 20
  });
  return streets.map((street) => {
    var _a, _b;
    return {
      label: `${street.streetType || "ul."} ${street.name}, ${street.locality.name}`,
      value: `${((_a = street.locality.terytArea) == null ? void 0 : _a.terytCode) || ""}:${street.locality.simcCode}:${street.ulicCode}`,
      terytCode: ((_b = street.locality.terytArea) == null ? void 0 : _b.terytCode) || "",
      simcCode: street.locality.simcCode,
      ulicCode: street.ulicCode,
      locality: street.locality.name,
      street: street.name,
      streetType: street.streetType
    };
  });
}

const streetShortcutMap = {
  kos: "Romana Kose\u0142y",
  kro: "Tadeusza Kr\xF3la",
  krol: "Tadeusza Kr\xF3la",
  mic: "Adama Mickiewicza",
  mac: "Ignacego Maciejowskiego",
  mil: "Milberta",
  sch: "Schinzla",
  cie: "Cie\u015Bli",
  slo: "S\u0142owackiego",
  chwa: "os. Chwa\u0142ki",
  ak: "Armii Krajowej",
  pils: "Pi\u0142sudskiego",
  kier: "Kierzkowska",
  krak: "Krakowska",
  m: "Mickiewicza",
  zar: "Zarzekowice",
  zam: "Zamkowa",
  obr: "Obro\u0144c\xF3w",
  zol: "\u017B\xF3\u0142kiewskiego"
};
function toTitleCase(value) {
  return value.split("-").map((part) => part.charAt(0).toLocaleUpperCase("pl-PL") + part.slice(1).toLocaleLowerCase("pl-PL")).join("-");
}
function parseMikrotikComment(comment) {
  if (!comment.trim()) return null;
  const pattern = /(\d+)\s+([A-Za-zÀ-ÿ-]+)\s+(?:(?:M\/|m\.\s*|m)(\d+)\s+)?([A-Za-z]+)\s*(\d+[A-Za-z]?)/i;
  const match = comment.trim().match(pattern);
  if (!match) return null;
  const externalId = match[1];
  const lastName = match[2];
  const shortcutRaw = match[4];
  const streetNumber = match[5];
  if (!externalId || !lastName || !shortcutRaw || !streetNumber) return null;
  const shortcut = shortcutRaw.toLocaleLowerCase("pl-PL");
  return {
    externalId,
    lastName: toTitleCase(lastName),
    apartmentNumber: match[3] || "",
    streetName: streetShortcutMap[shortcut] || shortcutRaw,
    streetNumber: streetNumber.toLocaleUpperCase("pl-PL")
  };
}

function toMbps(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.endsWith("m")) return Math.max(1, Math.round(Number.parseFloat(normalized.slice(0, -1))));
  if (normalized.endsWith("k")) return Math.max(1, Math.round(Number.parseFloat(normalized.slice(0, -1)) / 1024));
  const bits = Number.parseInt(normalized, 10);
  if (!Number.isFinite(bits)) return null;
  return Math.max(1, Math.round(bits / 1024 / 1024));
}
function parseRateLimit(rateLimit) {
  if (!rateLimit || !rateLimit.includes("/")) return { uploadMbps: null, downloadMbps: null };
  const [uploadRaw = "", downloadRaw = ""] = rateLimit.split("/");
  return {
    uploadMbps: toMbps(uploadRaw),
    downloadMbps: toMbps(downloadRaw)
  };
}

function normalizeMac$2(mac) {
  return (mac == null ? void 0 : mac.trim().replaceAll("-", ":").replaceAll(".", ":").toUpperCase()) || null;
}
function importMacSuffix(mac) {
  var _a;
  return ((_a = normalizeMac$2(mac)) == null ? void 0 : _a.replaceAll(":", "").slice(-12)) || null;
}
function fallbackSuffix(lease) {
  var _a;
  return importMacSuffix(lease.macAddress) || ((_a = lease.address) == null ? void 0 : _a.replaceAll(".", "-")) || "import";
}
function formatParsedMikrotikAddress(parsed) {
  if (!parsed) return null;
  return [
    parsed.streetName,
    parsed.streetNumber,
    parsed.apartmentNumber ? `/${parsed.apartmentNumber}` : ""
  ].join("").trim();
}
function enrichMikrotikLeaseImport(lease, addressMatch, existingDeviceId) {
  const parsed = parseMikrotikComment(lease.comment || "");
  const rate = parseRateLimit(lease.rateLimit);
  const issues = [];
  const suffix = fallbackSuffix(lease);
  if (!parsed) issues.push("Nie rozpoznano komentarza");
  if (!lease.address) issues.push("Brak adresu IP");
  if (!lease.macAddress) issues.push("Brak MAC");
  if (parsed && !(addressMatch == null ? void 0 : addressMatch.streetId)) issues.push(`Brak dopasowania ulicy: ${parsed.streetName}`);
  if (existingDeviceId) issues.push("Konflikt MAC z istniej\u0105cym urz\u0105dzeniem");
  const customerName = (parsed == null ? void 0 : parsed.lastName) ? `Abonent ${parsed.lastName}` : `Abonent ${suffix}`;
  const hostnameSuffix = suffix.toLocaleLowerCase("pl-PL");
  const hostname = (parsed == null ? void 0 : parsed.lastName) ? `${parsed.lastName.toLocaleLowerCase("pl-PL")}-${hostnameSuffix}.netcoreops` : `device-${hostnameSuffix}.netcoreops`;
  return {
    parsed,
    customerName,
    hostname,
    displayAddress: (addressMatch == null ? void 0 : addressMatch.label) || formatParsedMikrotikAddress(parsed),
    issues,
    isReady: issues.length === 0,
    conflict: Boolean(existingDeviceId),
    tariffName: rate.uploadMbps && rate.downloadMbps ? `Import ${rate.downloadMbps}/${rate.uploadMbps} Mbps` : null
  };
}

function ipv4ToInt(address) {
  const octets = address.trim().split(".");
  if (octets.length !== 4) return null;
  let value = 0;
  for (const octetText of octets) {
    if (!/^\d+$/.test(octetText)) return null;
    const octet = Number(octetText);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null;
    value = (value << 8) + octet >>> 0;
  }
  return value >>> 0;
}
function parseCidr(cidr) {
  const [address, prefixText] = cidr.trim().split("/");
  if (!address || prefixText === void 0) return null;
  const prefix = Number(prefixText);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const networkAddress = ipv4ToInt(address);
  if (networkAddress === null) return null;
  const mask = prefix === 0 ? 0 : 4294967295 << 32 - prefix >>> 0;
  return {
    networkAddress,
    mask
  };
}
function isIpInCidr(ipAddress, cidr) {
  const ip = ipv4ToInt(ipAddress);
  const network = parseCidr(cidr);
  if (ip === null || !network) return false;
  return (ip & network.mask) >>> 0 === (network.networkAddress & network.mask) >>> 0;
}
function filterLeasesBySelectedNetworks(leases, selectedNetworks) {
  const normalizedNetworks = selectedNetworks.map((network) => network.trim()).filter(Boolean);
  if (!normalizedNetworks.length) return leases;
  return leases.filter((lease) => lease.address && normalizedNetworks.some((network) => isIpInCidr(lease.address, network)));
}

function stripNullBytes(value) {
  if (typeof value === "string") return value.replaceAll("\0", "");
  if (Array.isArray(value)) return value.map(stripNullBytes);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, rowValue]) => [key, stripNullBytes(rowValue)]));
  }
  return value;
}
function withoutRaw(value) {
  if (Array.isArray(value)) return value.map(withoutRaw);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "raw").map(([key, rowValue]) => [key, withoutRaw(rowValue)]));
  }
  return value;
}
function compactImportSummary(summary) {
  const actionCounts = summary.actions.reduce((counts, action) => {
    const key = `${action.entity}:${action.action}`;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  return stripNullBytes({
    mode: summary.mode,
    leases: summary.leases,
    onus: summary.onus,
    macs: summary.macs,
    actionCounts,
    sampleActions: withoutRaw(summary.actions.slice(0, 100))
  });
}
function normalizeMac$1(mac) {
  return (mac == null ? void 0 : mac.trim().replaceAll("-", ":").replaceAll(".", ":").toUpperCase()) || null;
}
async function getOrCreateOnuModelId() {
  const [type] = await db.insert(deviceTypes).values({
    name: "ONU",
    category: "KLIENCKIE",
    description: "Jednostka ONU/ONT importowana z OLT."
  }).onConflictDoNothing().returning();
  const existingType = type || await db.query.deviceTypes.findFirst({ where: eq(deviceTypes.name, "ONU") });
  if (!existingType) throw createError$1({ statusCode: 500, statusMessage: "Nie mo\u017Cna utworzy\u0107 typu ONU" });
  const [model] = await db.insert(deviceModels).values({
    typeId: existingType.id,
    manufacturer: "Generic",
    modelName: "ONU VLAN400 management"
  }).onConflictDoNothing().returning();
  const existingModel = model || await db.query.deviceModels.findFirst({ where: eq(deviceModels.modelName, "ONU VLAN400 management") });
  if (!existingModel) throw createError$1({ statusCode: 500, statusMessage: "Nie mo\u017Cna utworzy\u0107 modelu ONU" });
  return existingModel.id;
}
function importedCustomerName(lease) {
  const parsed = parseMikrotikComment(lease.comment || "");
  return (parsed == null ? void 0 : parsed.lastName) ? `Abonent ${parsed.lastName}` : `Abonent ${importMacSuffix(lease.macAddress) || "import"}`;
}
async function findAddressMatch(lease) {
  var _a, _b;
  const parsed = parseMikrotikComment(lease.comment || "");
  if (!parsed) return null;
  const street = await db.query.ulicStreets.findFirst({
    where: ilike(ulicStreets.name, `%${parsed.streetName}%`),
    with: {
      locality: {
        with: {
          terytArea: true
        }
      }
    }
  });
  if (!street) return null;
  return {
    terytAreaId: (_b = (_a = street.locality.terytArea) == null ? void 0 : _a.id) != null ? _b : null,
    simcLocalityId: street.locality.id,
    streetId: street.id,
    label: `${street.streetType || "ul."} ${street.name} ${parsed.streetNumber}${parsed.apartmentNumber ? `/${parsed.apartmentNumber}` : ""}, ${street.locality.name}`
  };
}
async function findOrCreateCustomer(lease, mode, addressMatch, issues) {
  var _a, _b, _c;
  const parsed = parseMikrotikComment(lease.comment || "");
  const lastName = (parsed == null ? void 0 : parsed.lastName) || null;
  const mac = normalizeMac$1(lease.macAddress);
  const existing = (parsed == null ? void 0 : parsed.externalId) ? await db.query.customers.findFirst({ where: eq(customers.importExternalId, parsed.externalId) }) : lastName ? await db.query.customers.findFirst({ where: ilike(customers.lastName, lastName) }) : void 0;
  if (existing || mode !== "apply") return existing;
  const [customer] = await db.insert(customers).values({
    fullName: importedCustomerName(lease),
    customerType: "INDIVIDUAL",
    firstName: "Abonent",
    lastName: lastName || `Import ${importMacSuffix(lease.macAddress) || (mac == null ? void 0 : mac.slice(-6)) || "MAC"}`,
    billingTerytAreaId: (_a = addressMatch == null ? void 0 : addressMatch.terytAreaId) != null ? _a : null,
    billingSimcLocalityId: (_b = addressMatch == null ? void 0 : addressMatch.simcLocalityId) != null ? _b : null,
    billingStreetId: (_c = addressMatch == null ? void 0 : addressMatch.streetId) != null ? _c : null,
    billingBuildingNumber: (parsed == null ? void 0 : parsed.streetNumber) || null,
    billingApartmentNumber: (parsed == null ? void 0 : parsed.apartmentNumber) || null,
    billingAddress: (addressMatch == null ? void 0 : addressMatch.label) || lease.comment || null,
    importExternalId: (parsed == null ? void 0 : parsed.externalId) || null,
    importIssues: issues
  }).returning();
  return customer;
}
async function findOrCreateTariff(rateLimit, mode) {
  const parsed = parseRateLimit(rateLimit);
  if (!parsed.uploadMbps || !parsed.downloadMbps) return null;
  const existing = await db.query.tariffs.findFirst({
    where: and(
      eq(tariffs.uploadMbps, parsed.uploadMbps),
      eq(tariffs.downloadMbps, parsed.downloadMbps),
      eq(tariffs.serviceType, "internet")
    )
  });
  if (existing || mode !== "apply") return existing;
  const [tariff] = await db.insert(tariffs).values({
    name: `Import ${parsed.downloadMbps}/${parsed.uploadMbps} Mbps`,
    serviceType: "internet",
    defaultNetPrice: "0",
    vatRate: "23",
    uploadMbps: parsed.uploadMbps,
    downloadMbps: parsed.downloadMbps,
    description: `Automatycznie zaimportowana z MikroTik (${rateLimit})`
  }).returning();
  return tariff;
}
async function buildMikrotikLeaseActions(equipmentId, leases, mode, selectedNetworks = []) {
  const actions = [];
  for (const lease of filterLeasesBySelectedNetworks(leases, selectedNetworks)) {
    const mac = normalizeMac$1(lease.macAddress);
    if (!mac || !lease.address) continue;
    const existingDevice = await db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, mac) });
    const addressMatch = await findAddressMatch(lease);
    const enriched = enrichMikrotikLeaseImport(lease, addressMatch, existingDevice == null ? void 0 : existingDevice.id);
    const parsed = parseMikrotikComment(lease.comment || "");
    if (existingDevice) {
      actions.push({
        action: "conflict",
        entity: "customerDevice",
        key: mac,
        label: `${mac} / ${lease.address}`,
        reason: "MAC ju\u017C istnieje w bazie",
        data: { existingDeviceId: existingDevice.id, lease, parsed, enriched }
      });
      continue;
    }
    const customer = await findOrCreateCustomer(lease, mode, addressMatch, enriched.issues);
    const tariff = await findOrCreateTariff(lease.rateLimit, mode);
    actions.push({
      action: mode === "apply" ? "create" : "link",
      entity: "customerDevice",
      key: mac,
      label: `${mac} / ${lease.address}`,
      data: { lease, parsed, enriched, addressMatch, customerId: customer == null ? void 0 : customer.id, tariffId: tariff == null ? void 0 : tariff.id }
    });
    if (mode === "apply" && customer) {
      const [device] = await db.insert(customerDevices).values({
        customerId: customer.id,
        equipmentId,
        hostname: enriched.hostname,
        ipAddress: lease.address,
        macAddress: mac,
        status: lease.disabled || lease.blocked ? "INACTIVE" : "ACTIVE",
        dhcpServer: lease.server || null,
        dhcpInterface: lease.interface || null,
        importExternalId: (parsed == null ? void 0 : parsed.externalId) || null,
        importIssues: enriched.issues,
        notes: lease.comment || null
      }).returning();
      if (!device) continue;
      if (tariff) {
        await db.insert(subscriptions).values({
          customerId: customer.id,
          customerDeviceId: device.id,
          tariffId: tariff.id,
          status: "ACTIVE"
        });
      }
    }
  }
  return actions;
}
async function recordImportRun(equipmentId, driverCode, importType, mode, summary) {
  await db.insert(importRuns).values({
    equipmentId,
    driverCode,
    importType,
    mode: mode === "dryRun" ? "preview" : mode,
    success: true,
    summary: stripNullBytes(withoutRaw(summary))
  });
}

function normalizeDasanNumericId(value) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? String(parsed) : value.trim();
}
function parseDasanOnuActive(raw) {
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\w+)\s*\|\s*\w+\s*\|\s*(\w+)(?:\s*\|[^\n|]*)?(?:\|\s*([0-9:]+))?/);
    if (!match) continue;
    const [, oltPort, onuId, status, serialNumber, uptime] = match;
    if (!oltPort || !onuId || !status || !serialNumber) continue;
    rows.push({
      oltPort: normalizeDasanNumericId(oltPort),
      onuId: normalizeDasanNumericId(onuId),
      status,
      serialNumber,
      uptime
    });
  }
  return rows;
}
function parseDasanMacTable(raw) {
  const rows = [];
  const isUsableMac = (macAddress) => macAddress.toLowerCase() !== "00:00:00:00:00:00";
  for (const line of raw.split(/\r?\n/)) {
    const oltMatch = line.match(/^\s*\d+\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([0-9a-fA-F:]{17})\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\w+)/);
    if (oltMatch) {
      const [, oltPort, onuId, macAddress, gemId, vlanId, status] = oltMatch;
      if (!oltPort || !onuId || !macAddress || !gemId || !vlanId || !status || !isUsableMac(macAddress)) continue;
      rows.push({
        oltPort,
        onuId,
        macAddress: macAddress.toLowerCase(),
        gemId,
        vlanId,
        status
      });
      continue;
    }
    const bridgeMatch = line.match(/^\s*(\d+)\s+([a-zA-Z0-9/]+)\s+([0-9a-fA-F:]{17})(?:\s+\w+)?(?:\s+(\w+))?/);
    if (bridgeMatch) {
      const [, vlanId, port, macAddress, status] = bridgeMatch;
      if (!vlanId || !port || !macAddress || !isUsableMac(macAddress)) continue;
      rows.push({
        port,
        macAddress: macAddress.toLowerCase(),
        vlanId,
        status: status || "dynamic"
      });
    }
  }
  return rows;
}
function parseDasanRxPower(raw) {
  var _a;
  const rows = /* @__PURE__ */ new Map();
  let currentOltPort = null;
  let currentOnuId = null;
  const addRow = (oltPort, onuId, signalRx) => {
    const row = {
      oltPort: normalizeDasanNumericId(oltPort),
      onuId: normalizeDasanNumericId(onuId),
      signalRx: signalRx.trim()
    };
    rows.set(`${row.oltPort}:${row.onuId}`, row);
  };
  for (const line of raw.split(/\r?\n/)) {
    const command = line.match(/show\s+olt\s+rx-power\s+(\d+)(?:\s+(\d+))?/i);
    if (command == null ? void 0 : command[1]) {
      currentOltPort = normalizeDasanNumericId(command[1]);
      currentOnuId = command[2] ? normalizeDasanNumericId(command[2]) : null;
    }
    const match = line.match(/(\d+)\/(\d+)\s+(-?\d+(?:\.\d+)?\s*dBm)/);
    if ((match == null ? void 0 : match[1]) && match[2] && match[3]) {
      addRow(match[1], match[2], match[3]);
      continue;
    }
    if (!currentOltPort) continue;
    if (currentOnuId) {
      const scopedSignal = (_a = line.match(/(-?\d+(?:\.\d+)?\s*dBm)/i)) == null ? void 0 : _a[1];
      if (scopedSignal) {
        addRow(currentOltPort, currentOnuId, scopedSignal);
        continue;
      }
    }
    const tableMatch = line.match(/^\s*(\d+)\b.*?(-?\d+(?:\.\d+)?\s*dBm)/i);
    const onuId = tableMatch == null ? void 0 : tableMatch[1];
    const signalRx = tableMatch == null ? void 0 : tableMatch[2];
    if (!onuId || !signalRx) continue;
    addRow(currentOltPort, onuId, signalRx);
  }
  return [...rows.values()];
}
function parseDasanOnuIpHosts(raw) {
  const rows = [];
  let current = null;
  for (const line of raw.split(/\r?\n/)) {
    const header = line.match(/OLT\s*:\s*(\d+),\s*ONU\s*:\s*(\d+),\s*Host\s*:\s*([^\s(]+)/i);
    if (header) {
      if (current) rows.push(current);
      const [, oltPort, onuId, hostId] = header;
      current = { oltPort: oltPort || "", onuId: onuId || "", hostId: hostId || "" };
      continue;
    }
    if (!current) continue;
    const field = line.match(/^\s*([^:]+?)\s*:\s*(.*)$/);
    if (!field) continue;
    const [, rawKey, rawValue] = field;
    const value = (rawValue == null ? void 0 : rawValue.trim()) || "";
    switch (rawKey == null ? void 0 : rawKey.trim().toLowerCase()) {
      case "ip option":
        current.ipOption = value;
        break;
      case "mac address":
        current.macAddress = value.toLowerCase();
        break;
      case "current ip":
        current.currentIp = value;
        break;
      case "current mask":
        current.currentMask = value;
        break;
      case "current gateway":
        current.currentGateway = value;
        break;
      case "current primary dns":
        current.primaryDns = value;
        break;
      case "current secondary dns":
        current.secondaryDns = value;
        break;
      case "domain name":
        current.domainName = value;
        break;
      case "host name":
        current.hostName = value;
        break;
    }
  }
  if (current) rows.push(current);
  return rows.filter((row) => row.oltPort && row.onuId && row.hostId);
}

function unsupportedCheck(name) {
  return { name, status: "unsupported", message: "Driver nie wspiera tej operacji" };
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
function summarizeCommands(output) {
  return [...new Set(output.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.includes("show cli") && !line.includes("show list")).filter((line) => !line.endsWith(">") && !line.endsWith("#") && !line.startsWith("--")).filter((line) => /^[a-z][a-z0-9_-]+(?:\s+[a-z0-9_|./-]+)?/i.test(line)).slice(0, 2e3))];
}
class DasanDriver {
  constructor(equipment) {
    __publicField$3(this, "equipment", equipment);
    __publicField$3(this, "code", "dasan_nos");
  }
  get host() {
    const value = this.equipment.managementIp || this.equipment.hostname || "";
    return value.includes(":") ? value.split(":")[0] || "" : value;
  }
  get port() {
    var _a;
    const value = this.equipment.managementIp || "";
    if (value.includes(":")) return Number.parseInt(value.split(":")[1] || "22502", 10);
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.defaultPort) || this.equipment.managementPort || 22502;
  }
  get username() {
    var _a;
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.username) || "";
  }
  get password() {
    var _a;
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.passwordEncrypted) || "";
  }
  sanitizeOutput(output) {
    var _a, _b, _c;
    const secrets = [
      (_a = this.equipment.accessProfile) == null ? void 0 : _a.passwordEncrypted,
      (_b = this.equipment.accessProfile) == null ? void 0 : _b.apiTokenEncrypted,
      (_c = this.equipment.accessProfile) == null ? void 0 : _c.snmpCommunityEncrypted
    ].filter((value) => Boolean(value));
    return secrets.reduce((sanitized, secret) => sanitized.split(secret).join("[redacted]"), output);
  }
  runCommands(commands) {
    return new Promise((resolve, reject) => {
      const client = new Client();
      const outputs = [];
      let buffer = "";
      let commandIndex = 0;
      const promptPattern = /(?:SWITCH|OLT)[^\r\n]*[>#]\s*$/;
      const sendNext = (stream) => {
        if (commandIndex >= commands.length) {
          stream.end("exit\n");
          return;
        }
        stream.write(`${commands[commandIndex]}
`);
        commandIndex += 1;
      };
      client.on("ready", () => {
        client.shell((error, stream) => {
          if (error) {
            reject(error);
            client.end();
            return;
          }
          stream.on("close", () => {
            if (buffer.trim()) outputs.push(buffer);
            client.end();
            resolve(outputs);
          }).on("data", (chunk) => {
            buffer += chunk.toString("utf8");
            if (promptPattern.test(buffer)) {
              outputs.push(buffer);
              buffer = "";
              sendNext(stream);
            }
          });
          sendNext(stream);
        });
      }).on("error", reject).connect({
        host: this.host,
        port: this.port,
        username: this.username,
        password: this.password,
        algorithms: {
          kex: [
            "diffie-hellman-group14-sha1",
            "diffie-hellman-group1-sha1",
            "diffie-hellman-group-exchange-sha1"
          ],
          serverHostKey: ["ssh-rsa", "ssh-dss"],
          cipher: [
            "aes128-cbc",
            "3des-cbc",
            "aes192-cbc",
            "aes256-cbc",
            "aes128-ctr",
            "aes192-ctr",
            "aes256-ctr"
          ],
          hmac: ["hmac-sha1", "hmac-md5"]
        },
        readyTimeout: 15e3,
        tryKeyboard: false
      });
    });
  }
  async safeCheck(name, callback) {
    try {
      const data = await callback();
      return { name, status: "ok", data };
    } catch (error) {
      return { name, status: "error", message: error instanceof Error ? error.message : String(error) };
    }
  }
  async ping() {
    return unsupportedCheck("ping");
  }
  async arpPing() {
    return unsupportedCheck("arp-ping");
  }
  async getDhcpLease() {
    return unsupportedCheck("dhcp-lease");
  }
  async getBridgeHost(macAddress) {
    return this.safeCheck("bridge-host", async () => {
      const output = await this.runCommands(["terminal length 0", "enable", `show mac | include ${macAddress}`]);
      return parseDasanMacTable(output.join("\n")).filter((row) => row.macAddress.toLowerCase() === macAddress.toLowerCase());
    });
  }
  async getSwitchFdb(macAddress) {
    return this.getBridgeHost(macAddress);
  }
  async getLeases() {
    return [];
  }
  async getNetworks() {
    return [];
  }
  selectOnusForRxScan(onus, options = {}) {
    const numericPart = (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
    };
    const sorted = [...onus].filter((onu) => {
      var _a;
      return !options.activeOnly || ((_a = onu.status) == null ? void 0 : _a.toLowerCase()) === "active";
    }).sort((left, right) => {
      const portDiff = numericPart(left.oltPort) - numericPart(right.oltPort);
      if (portDiff) return portDiff;
      const onuDiff = numericPart(left.onuId) - numericPart(right.onuId);
      if (onuDiff) return onuDiff;
      return `${left.oltPort}:${left.onuId}`.localeCompare(`${right.oltPort}:${right.onuId}`);
    });
    if (options.rangeFrom || options.rangeTo) {
      const start = Math.max((options.rangeFrom || 1) - 1, 0);
      const end = Math.max(options.rangeTo || sorted.length, start);
      return sorted.slice(start, end);
    }
    return sorted.slice(0, options.limit);
  }
  async getOnus(options = {}) {
    const output = await this.runCommands(["terminal length 0", "show onu active"]);
    const onus = parseDasanOnuActive(output.join("\n"));
    const selectedOnus = this.selectOnusForRxScan(onus, options);
    if (!selectedOnus.length) return selectedOnus;
    try {
      const rxCommands = selectedOnus.map((onu) => `show olt rx-power ${onu.oltPort} ${onu.onuId}`);
      const rxOutput = await this.runCommands(["terminal length 0", "enable", ...rxCommands]);
      const rxByOnu = new Map(parseDasanRxPower(rxOutput.join("\n")).map((row) => [`${row.oltPort}:${row.onuId}`, row.signalRx]));
      return selectedOnus.map((onu) => ({
        ...onu,
        signalRx: rxByOnu.get(`${onu.oltPort}:${onu.onuId}`)
      }));
    } catch {
      return selectedOnus;
    }
  }
  async getOnuInfo(oltPort, onuId) {
    return this.safeCheck("onu-info", async () => {
      const output = await this.runCommands([
        "terminal length 0",
        "enable",
        `show onu active ${oltPort}`,
        `show olt rx-power ${oltPort} ${onuId}`,
        `show onu ip-host ${oltPort} ${onuId}`
      ]);
      const active = parseDasanOnuActive(output.join("\n")).find((row) => row.oltPort === oltPort && row.onuId === onuId);
      const power = parseDasanRxPower(output.join("\n")).find((row) => row.oltPort === oltPort && row.onuId === onuId);
      const ipHosts = parseDasanOnuIpHosts(output.join("\n"));
      return {
        oltPort,
        onuId,
        status: (active == null ? void 0 : active.status) || "Unknown",
        serialNumber: (active == null ? void 0 : active.serialNumber) || "Unknown",
        uptime: (active == null ? void 0 : active.uptime) || "Unknown",
        signalRx: (power == null ? void 0 : power.signalRx) || "Unknown",
        ipHosts
      };
    });
  }
  async getOnuMacTable(oltPort, onuId) {
    const output = await this.runCommands(["terminal length 0", "enable", `show olt mac ${oltPort} ${onuId}`]);
    return parseDasanMacTable(output.join("\n"));
  }
  async getOnuIpHosts(oltPort, onuId) {
    const output = await this.runCommands(["terminal length 0", `show onu ip-host ${oltPort} ${onuId}`]);
    return parseDasanOnuIpHosts(output.join("\n"));
  }
  async upsertDhcpLease() {
    return unsupportedCheck("sync-lease");
  }
  async getActiveUsers() {
    return {
      totalLeases: 0,
      candidateLeases: 0,
      activeUsers: [],
      evidenceCounts: {
        arp: 0,
        bridgeHost: 0,
        switchFdb: 0
      }
    };
  }
  async configureNetflow() {
    return unsupportedCheck("netflow-config");
  }
  async getCommandTree() {
    return this.safeCheck("command-tree", async () => {
      const cliOutput = await this.runCommands(["terminal length 0", "show cli", "show list"]);
      const enableOutput = await this.runCommands(["terminal length 0", "enable", "show cli", "show list"]);
      const cliRaw = this.sanitizeOutput(cliOutput.join("\n"));
      const enableRaw = this.sanitizeOutput(enableOutput.join("\n"));
      return {
        cli: summarizeCommands(cliRaw),
        enable: summarizeCommands(enableRaw),
        rawPreview: {
          cli: cliRaw.slice(0, 12e3),
          enable: enableRaw.slice(0, 12e3)
        }
      };
    });
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
class RouterOsApiClient {
  constructor(options) {
    __publicField$2(this, "options", options);
    __publicField$2(this, "socket", null);
    __publicField$2(this, "buffer", Buffer.alloc(0));
    __publicField$2(this, "waitingForData", null);
  }
  async connect() {
    if (this.socket) return;
    this.socket = new Socket();
    this.socket.setTimeout(this.options.timeoutMs || 12e3);
    this.socket.on("data", (chunk) => {
      var _a;
      const payload = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      this.buffer = Buffer.concat([this.buffer, payload]);
      (_a = this.waitingForData) == null ? void 0 : _a.call(this);
      this.waitingForData = null;
    });
    await new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error("RouterOS socket not initialized"));
      const onError = (error) => reject(error);
      this.socket.once("error", onError);
      this.socket.once("timeout", () => reject(new Error("RouterOS API timeout")));
      this.socket.connect(this.options.port, this.options.host, () => {
        var _a;
        (_a = this.socket) == null ? void 0 : _a.off("error", onError);
        resolve();
      });
    });
    await this.write("/login", [`=name=${this.options.username}`, `=password=${this.options.password}`]);
  }
  close() {
    var _a;
    (_a = this.socket) == null ? void 0 : _a.destroy();
    this.socket = null;
  }
  async write(command, args = []) {
    if (!this.socket) throw new Error("RouterOS API is not connected");
    for (const word of [command, ...args]) this.writeWord(word);
    this.writeWord("");
    const rows = [];
    while (true) {
      const sentence = await this.readSentence();
      const reply = sentence[0];
      if (!reply) continue;
      if (reply === "!re") rows.push(this.parseRow(sentence.slice(1)));
      if (reply === "!empty") continue;
      if (reply === "!done") return rows;
      if (reply === "!trap" || reply === "!fatal") {
        const row = this.parseRow(sentence.slice(1));
        throw new Error(row.message || row.category || reply);
      }
    }
  }
  writeWord(word) {
    if (!this.socket) throw new Error("RouterOS API is not connected");
    const payload = Buffer.from(word, "utf8");
    this.socket.write(Buffer.concat([this.encodeLength(payload.length), payload]));
  }
  encodeLength(length) {
    if (length < 128) return Buffer.from([length]);
    if (length < 16384) return Buffer.from([length >> 8 | 128, length & 255]);
    if (length < 2097152) return Buffer.from([length >> 16 | 192, length >> 8 & 255, length & 255]);
    if (length < 268435456) return Buffer.from([length >> 24 | 224, length >> 16 & 255, length >> 8 & 255, length & 255]);
    return Buffer.from([240, length >> 24 & 255, length >> 16 & 255, length >> 8 & 255, length & 255]);
  }
  async readSentence() {
    const words = [];
    while (true) {
      const word = await this.readWord();
      if (word === "") return words;
      words.push(word);
    }
  }
  async readWord() {
    while (true) {
      const parsed = this.tryReadWord();
      if (parsed !== null) return parsed;
      await this.waitForMoreData();
    }
  }
  tryReadWord() {
    const length = this.tryReadLength();
    if (!length) return null;
    const [byteCount, wordLength] = length;
    if (this.buffer.length < byteCount + wordLength) return null;
    const word = this.buffer.subarray(byteCount, byteCount + wordLength).toString("utf8");
    this.buffer = this.buffer.subarray(byteCount + wordLength);
    return word;
  }
  tryReadLength() {
    if (this.buffer.length < 1) return null;
    const first = this.buffer[0];
    if (first === void 0) return null;
    if ((first & 128) === 0) return [1, first];
    if ((first & 192) === 128) {
      if (this.buffer.length < 2) return null;
      return [2, ((first & -193) << 8) + this.buffer[1]];
    }
    if ((first & 224) === 192) {
      if (this.buffer.length < 3) return null;
      return [3, ((first & -225) << 16) + (this.buffer[1] << 8) + this.buffer[2]];
    }
    if ((first & 240) === 224) {
      if (this.buffer.length < 4) return null;
      return [4, ((first & -241) << 24) + (this.buffer[1] << 16) + (this.buffer[2] << 8) + this.buffer[3]];
    }
    if (this.buffer.length < 5) return null;
    return [5, (this.buffer[1] << 24) + (this.buffer[2] << 16) + (this.buffer[3] << 8) + this.buffer[4]];
  }
  async waitForMoreData() {
    if (!this.socket) throw new Error("RouterOS API is not connected");
    await new Promise((resolve, reject) => {
      const socket = this.socket;
      if (!socket) return reject(new Error("RouterOS API is not connected"));
      const cleanup = () => {
        socket.off("error", onError);
        socket.off("timeout", onTimeout);
        socket.off("close", onClose);
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error("RouterOS API timeout"));
      };
      const onClose = () => {
        cleanup();
        reject(new Error("RouterOS API connection closed"));
      };
      this.waitingForData = () => {
        cleanup();
        resolve();
      };
      socket.once("error", onError);
      socket.once("timeout", onTimeout);
      socket.once("close", onClose);
    });
  }
  parseRow(words) {
    const row = {};
    for (const word of words) {
      const match = word.match(/^=([^=]+)=(.*)$/);
      if (!match) continue;
      row[match[1]] = match[2];
    }
    return row;
  }
}

function rowString$1(row, key) {
  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
}
function isEnabled$1(row) {
  const disabled = rowString$1(row, "disabled").toLowerCase();
  return disabled !== "true" && disabled !== "yes";
}
function isActive(row) {
  const active = rowString$1(row, "active").toLowerCase();
  const flags = rowString$1(row, "flags").toUpperCase();
  return active === "true" || active === "yes" || flags.includes("A") || !active && !flags.includes("I");
}
function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function isIpAddressLike(value) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) || value.includes(":");
}
function parseNetflowCollector(value) {
  const input = (value || "").trim();
  const match = input.match(/^(.+):(\d{1,5})$/);
  if (!match) throw new Error("Collector NetFlow musi mie\u0107 format IP:PORT, np. 10.0.222.226:2055");
  const port = Number(match[2]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Port collectora NetFlow musi by\u0107 z zakresu 1-65535");
  }
  return { address: match[1].trim(), port, version: "ipfix" };
}
function extractDhcpInterfaces(rows) {
  return unique(rows.filter(isEnabled$1).map((row) => rowString$1(row, "interface")));
}
function extractBridgePorts(rows, bridgeNames) {
  const bridges = new Set(bridgeNames);
  const portsByBridge = /* @__PURE__ */ new Map();
  for (const row of rows.filter(isEnabled$1)) {
    const bridge = rowString$1(row, "bridge");
    const port = rowString$1(row, "interface");
    if (!bridge || !port || !bridges.has(bridge)) continue;
    portsByBridge.set(bridge, unique([...portsByBridge.get(bridge) || [], port]));
  }
  return portsByBridge;
}
function extractBridgePortInterfaces(rows) {
  const portsByBridge = /* @__PURE__ */ new Map();
  for (const row of rows.filter(isEnabled$1)) {
    const bridge = rowString$1(row, "bridge");
    const port = rowString$1(row, "interface");
    if (!bridge || !port) continue;
    portsByBridge.set(bridge, unique([...portsByBridge.get(bridge) || [], port]));
  }
  return portsByBridge;
}
function extractDefaultGatewayInterfaces(rows) {
  var _a;
  const interfaces = [];
  for (const row of rows) {
    const destination = rowString$1(row, "dst-address");
    if (destination && destination !== "0.0.0.0/0" && destination !== "::/0") continue;
    if (!isActive(row)) continue;
    const immediateGateway = rowString$1(row, "immediate-gw");
    const immediateInterface = immediateGateway.includes("%") ? immediateGateway.split("%").pop() : "";
    if (immediateInterface) interfaces.push(immediateInterface);
    const gateway = rowString$1(row, "gateway");
    if (gateway && !isIpAddressLike(gateway)) interfaces.push(gateway);
    const gatewayStatus = rowString$1(row, "gateway-status");
    const statusInterface = (_a = gatewayStatus.match(/\bvia\s+([^\s,]+)/i)) == null ? void 0 : _a[1];
    if (statusInterface) interfaces.push(statusInterface);
  }
  return unique(interfaces);
}
function extractVlanParentInterfaces(rows, interfaceNamesById = /* @__PURE__ */ new Map()) {
  const parents = /* @__PURE__ */ new Map();
  for (const row of rows.filter(isEnabled$1)) {
    const name = rowString$1(row, "name");
    const rawParentInterface = rowString$1(row, "interface");
    const parentInterface = interfaceNamesById.get(rawParentInterface) || rawParentInterface;
    if (!name || !parentInterface) continue;
    parents.set(name, parentInterface);
  }
  return parents;
}
function resolveInterfaceSpeedBps(interfaceName, directSpeedsByName, parentInterfacesByName, childInterfacesByName = /* @__PURE__ */ new Map(), visited = /* @__PURE__ */ new Set()) {
  const directSpeed = directSpeedsByName.get(interfaceName);
  if (typeof directSpeed === "number") return directSpeed;
  if (visited.has(interfaceName)) return void 0;
  const nextVisited = /* @__PURE__ */ new Set([...visited, interfaceName]);
  const childSpeeds = (childInterfacesByName.get(interfaceName) || []).map((childInterface) => resolveInterfaceSpeedBps(
    childInterface,
    directSpeedsByName,
    parentInterfacesByName,
    childInterfacesByName,
    nextVisited
  )).filter((speed) => typeof speed === "number");
  if (childSpeeds.length) return childSpeeds.reduce((sum, speed) => sum + speed, 0);
  const parentInterface = parentInterfacesByName.get(interfaceName);
  if (!parentInterface) return void 0;
  return resolveInterfaceSpeedBps(
    parentInterface,
    directSpeedsByName,
    parentInterfacesByName,
    childInterfacesByName,
    nextVisited
  );
}
function buildNetflowInterfacePlan(input) {
  const dhcpServerInterfaces = extractDhcpInterfaces(input.dhcpServers);
  const bridgePortsByBridge = extractBridgePorts(input.bridgePorts || [], dhcpServerInterfaces);
  const dhcpRoles = dhcpServerInterfaces.flatMap((dhcpInterface) => {
    const bridgePorts = bridgePortsByBridge.get(dhcpInterface) || [];
    if (!bridgePorts.length) return [{ name: dhcpInterface, role: "dhcp" }];
    return bridgePorts.map((name) => ({ name, role: "dhcp", sourceInterface: dhcpInterface }));
  });
  const dhcpInterfaces = unique(dhcpRoles.map((role) => role.name));
  const uplinkInterfaces = extractDefaultGatewayInterfaces(input.routes);
  const uplinkRoles = uplinkInterfaces.map((name) => ({ name, role: "uplink" }));
  const roleSources = [...dhcpRoles, ...uplinkRoles];
  return {
    dhcpServerInterfaces,
    dhcpInterfaces,
    uplinkInterfaces,
    interfaces: unique(roleSources.map((role) => role.name)),
    roleSources
  };
}
function parseInterfaceSpeedBps(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(/^(\d+(?:\.\d+)?)(t|g|m|k)?(?:bit\/s|bps|b)?(?:-.+)?$/);
  if (!match) return void 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return void 0;
  const unit = match[2] || "";
  const multiplier = unit === "t" ? 1e12 : unit === "g" ? 1e9 : unit === "m" ? 1e6 : unit === "k" ? 1e3 : 1;
  return Math.round(amount * multiplier);
}

function rowString(row, key) {
  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
}
function isEnabled(row) {
  const disabled = rowString(row, "disabled").toLowerCase();
  return disabled !== "true" && disabled !== "yes";
}
function routerOsIdToIfIndex(value) {
  if (typeof value !== "string" || !value.startsWith("*")) return void 0;
  const parsed = Number.parseInt(value.slice(1), 16);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function toOptionalNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : void 0;
}
function setIfMissing(roleMap, ifIndex, config) {
  if (typeof ifIndex !== "number") return;
  if (!roleMap.has(ifIndex)) roleMap.set(ifIndex, config);
}
function rawInterfaceIndexes(rows) {
  const indexes = /* @__PURE__ */ new Map();
  for (const row of rows || []) {
    const name = rowString(row, "name");
    const ifIndex = routerOsIdToIfIndex(rowString(row, ".id"));
    if (name && typeof ifIndex === "number") indexes.set(name, ifIndex);
  }
  return indexes;
}
function sumSourceSpeeds(interfaceRoles, sourceInterface) {
  const speed = (interfaceRoles || []).filter((role) => role.sourceInterface === sourceInterface).reduce((sum, role) => sum + (toOptionalNumber(role.speedBps) || 0), 0);
  return speed > 0 ? speed : void 0;
}
function buildNetflowInterfaceRoleMaps(diagnosticRows, equipmentRows) {
  var _a, _b, _c, _d, _e;
  const equipmentIpById = new Map(equipmentRows.map((row) => [row.id, row.managementIp || row.hostname || "unknown"]));
  const rolesByExporter = /* @__PURE__ */ new Map();
  for (const run of diagnosticRows) {
    if (run.runType !== "netflow-config" || !run.equipmentId) continue;
    const exporter = equipmentIpById.get(run.equipmentId);
    if (!exporter) continue;
    const result = run.result;
    const roleMap = rolesByExporter.get(exporter) || /* @__PURE__ */ new Map();
    const interfaceIndexes = rawInterfaceIndexes((_b = (_a = result.data) == null ? void 0 : _a.raw) == null ? void 0 : _b.routerInterfaces);
    const interfaceRoles = ((_c = result.data) == null ? void 0 : _c.interfaceRoles) || [];
    for (const role of interfaceRoles) {
      if (!role.name || !role.role) continue;
      setIfMissing(roleMap, role.ifIndex, {
        name: role.name,
        role: role.role,
        sourceInterface: role.sourceInterface,
        speedBps: toOptionalNumber(role.speedBps)
      });
    }
    for (const server of ((_e = (_d = result.data) == null ? void 0 : _d.raw) == null ? void 0 : _e.dhcpServers) || []) {
      if (!isEnabled(server)) continue;
      const name = rowString(server, "interface");
      setIfMissing(roleMap, interfaceIndexes.get(name), {
        name,
        role: "dhcp",
        speedBps: sumSourceSpeeds(interfaceRoles, name)
      });
    }
    for (const [name, ifIndex] of interfaceIndexes) {
      setIfMissing(roleMap, ifIndex, { name, role: "unknown" });
    }
    rolesByExporter.set(exporter, roleMap);
  }
  return rolesByExporter;
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function normalizeBool(value) {
  return String(value).toLowerCase() === "true";
}
function normalizeMac(value) {
  return typeof value === "string" ? value.toUpperCase() : void 0;
}
function asRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object") : [];
}
function rowMac(row) {
  return normalizeMac(row["mac-address"] || row.macAddress || row.mac);
}
class MikrotikDriver {
  constructor(equipment) {
    __publicField$1(this, "equipment", equipment);
    __publicField$1(this, "code", "mikrotik_v7");
  }
  get host() {
    return this.equipment.managementIp || this.equipment.hostname || "";
  }
  get port() {
    var _a;
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.defaultPort) || this.equipment.managementPort || 8728;
  }
  get username() {
    var _a;
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.username) || "";
  }
  get password() {
    var _a;
    return ((_a = this.equipment.accessProfile) == null ? void 0 : _a.passwordEncrypted) || "";
  }
  async withApi(callback) {
    const connection = new RouterOsApiClient({
      host: this.host,
      username: this.username,
      password: this.password,
      port: this.port,
      timeoutMs: 12e3
    });
    await connection.connect();
    try {
      return await callback(connection);
    } finally {
      connection.close();
    }
  }
  async safeCheck(name, callback) {
    try {
      const data = await callback();
      return { name, status: "ok", data };
    } catch (error) {
      return { name, status: "error", message: error instanceof Error ? error.message : String(error) };
    }
  }
  async ping(target) {
    return this.safeCheck("ping", () => this.withApi((api) => api.write("/ping", [`=address=${target}`, "=count=3"])));
  }
  async arpPing(target) {
    return this.safeCheck("arp-ping", async () => {
      var _a;
      const arpRows = asRows(await this.withApi((api) => api.write("/ip/arp/print", [`?address=${target}`])));
      const iface = typeof ((_a = arpRows[0]) == null ? void 0 : _a.interface) === "string" ? arpRows[0].interface : void 0;
      if (!iface) return [{ status: "ARP entry not found" }];
      return this.withApi((api) => api.write("/ping", [`=address=${target}`, "=count=3", "=arp-ping=yes", `=interface=${iface}`]));
    });
  }
  async getDhcpLease(macAddress) {
    return this.safeCheck("dhcp-lease", async () => {
      const rows = asRows(await this.withApi((api) => api.write("/ip/dhcp-server/lease/print", [`?mac-address=${macAddress}`])));
      return rows[0] || null;
    });
  }
  async getBridgeHost(macAddress) {
    return this.safeCheck("bridge-host", () => this.withApi((api) => api.write("/interface/bridge/host/print", [`?mac-address=${macAddress}`])));
  }
  async getSwitchFdb(macAddress) {
    var _a, _b;
    const hostResult = await this.safeCheck("switch-fdb", () => this.withApi((api) => api.write("/interface/ethernet/switch/host/print", [`?mac-address=${macAddress}`])));
    if (hostResult.status !== "error" || !((_a = hostResult.message) == null ? void 0 : _a.includes("no such command prefix"))) return hostResult;
    const fdbResult = await this.safeCheck("switch-fdb", () => this.withApi((api) => api.write("/interface/ethernet/switch/fdb/print", [`?mac-address=${macAddress}`])));
    if (fdbResult.status === "error" && ((_b = fdbResult.message) == null ? void 0 : _b.includes("no such command prefix"))) {
      return {
        name: "switch-fdb",
        status: "unsupported",
        message: "RouterOS na tym urz\u0105dzeniu nie udost\u0119pnia switch/host ani switch/fdb"
      };
    }
    return fdbResult;
  }
  async getLeases() {
    const [rows, servers] = await Promise.all([
      this.withApi((api) => api.write("/ip/dhcp-server/lease/print")).then(asRows),
      this.withApi((api) => api.write("/ip/dhcp-server/print")).then(asRows)
    ]);
    const serverInterfaceByName = new Map(servers.map((row) => [
      typeof row.name === "string" ? row.name : "",
      typeof row.interface === "string" ? row.interface : void 0
    ]).filter(([name, iface]) => Boolean(name) && Boolean(iface)));
    return rows.map((row) => ({
      id: typeof row[".id"] === "string" ? row[".id"] : typeof row.id === "string" ? row.id : void 0,
      address: typeof row.address === "string" ? row.address : void 0,
      macAddress: normalizeMac(row["mac-address"]),
      comment: typeof row.comment === "string" ? row.comment : void 0,
      rateLimit: typeof row["rate-limit"] === "string" ? row["rate-limit"] : void 0,
      status: typeof row.status === "string" ? row.status : void 0,
      disabled: normalizeBool(row.disabled),
      blocked: normalizeBool(row.blocked),
      server: typeof row.server === "string" ? row.server : void 0,
      serverInterface: typeof row.server === "string" ? serverInterfaceByName.get(row.server) : void 0,
      interface: typeof row.interface === "string" ? row.interface : void 0,
      raw: row
    }));
  }
  async getActiveUsers() {
    const [leases, arpRows, bridgeRows, switchRows, fdbRows] = await Promise.all([
      this.getLeases(),
      this.withApi((api) => api.write("/ip/arp/print")).then(asRows).catch(() => []),
      this.withApi((api) => api.write("/interface/bridge/host/print")).then(asRows).catch(() => []),
      this.withApi((api) => api.write("/interface/ethernet/switch/host/print")).then(asRows).catch(() => []),
      this.withApi((api) => api.write("/interface/ethernet/switch/fdb/print")).then(asRows).catch(() => [])
    ]);
    const arpMacs = new Set(arpRows.map(rowMac).filter(Boolean));
    const arpIps = new Set(arpRows.map((row) => typeof row.address === "string" ? row.address : "").filter(Boolean));
    const bridgeMacs = new Set(bridgeRows.map(rowMac).filter(Boolean));
    const switchMacs = new Set([...switchRows, ...fdbRows].map(rowMac).filter(Boolean));
    const candidates = leases.filter((lease) => lease.macAddress && lease.address && !lease.disabled && !lease.blocked);
    return {
      totalLeases: leases.length,
      candidateLeases: candidates.length,
      activeUsers: candidates.flatMap((lease) => {
        const evidence = [];
        if (arpMacs.has(lease.macAddress) || arpIps.has(lease.address)) evidence.push("arp");
        if (bridgeMacs.has(lease.macAddress)) evidence.push("bridge-host");
        if (switchMacs.has(lease.macAddress)) evidence.push("switch-fdb");
        if (!evidence.length) return [];
        return [{
          macAddress: lease.macAddress,
          ipAddress: lease.address,
          server: lease.server,
          serverInterface: lease.serverInterface || lease.interface,
          evidence
        }];
      }),
      evidenceCounts: {
        arp: arpMacs.size,
        bridgeHost: bridgeMacs.size,
        switchFdb: switchMacs.size
      }
    };
  }
  async getNetworks() {
    const rows = asRows(await this.withApi((api) => api.write("/ip/dhcp-server/network/print")));
    return rows.filter((row) => typeof row.address === "string" && row.address.includes("/")).map((row) => ({
      cidr: row.address,
      gateway: typeof row.gateway === "string" ? row.gateway : null,
      comment: typeof row.comment === "string" ? row.comment : null,
      raw: row
    }));
  }
  async getOnus() {
    return [];
  }
  async getOnuInfo() {
    return unsupportedCheck("onu-info");
  }
  async getOnuMacTable() {
    return [];
  }
  async getOnuIpHosts() {
    return [];
  }
  async upsertDhcpLease(payload) {
    return this.safeCheck("sync-lease", async () => {
      var _a;
      const existing = asRows(await this.withApi((api) => api.write("/ip/dhcp-server/lease/print", [`?mac-address=${payload.macAddress}`])));
      const body = [
        `=mac-address=${payload.macAddress}`,
        `=address=${payload.ipAddress}`,
        `=comment=${payload.comment || ""}`
      ];
      if (payload.rateLimit) body.push(`=rate-limit=${payload.rateLimit}`);
      const existingId = typeof ((_a = existing[0]) == null ? void 0 : _a[".id"]) === "string" ? existing[0][".id"] : null;
      if (existingId) {
        await this.withApi((api) => api.write("/ip/dhcp-server/lease/set", [`=.id=${existingId}`, ...body]));
        return { action: "updated", payload };
      }
      await this.withApi((api) => api.write("/ip/dhcp-server/lease/add", body));
      return { action: "created", payload };
    });
  }
  async configureNetflow(config) {
    return this.safeCheck("netflow-config", async () => {
      const collector = parseNetflowCollector(config.collector);
      const targetVersion = config.version || collector.version;
      const dhcpServers = asRows(await this.withApi((api) => api.write("/ip/dhcp-server/print")));
      const routes = asRows(await this.withApi((api) => api.write("/ip/route/print", ["?dst-address=0.0.0.0/0"])));
      const bridgePorts = asRows(await this.withApi((api) => api.write("/interface/bridge/port/print", ["=.proplist=.id,interface,bridge,disabled"])));
      const routerInterfaces = asRows(await this.withApi((api) => api.write("/interface/print", ["=.proplist=.id,name"])));
      const ethernetInterfaces = asRows(await this.withApi((api) => api.write("/interface/ethernet/print", ["=.proplist=name,speed,actual-speed"])));
      const vlanInterfaces = asRows(await this.withApi((api) => api.write("/interface/vlan/print", ["=.proplist=.id,name,interface,disabled"])));
      const plan = buildNetflowInterfacePlan({ dhcpServers, routes, bridgePorts });
      const ethernetNames = ethernetInterfaces.map((row) => typeof row.name === "string" ? row.name : "").filter(Boolean);
      const monitoredEthernetInterfaces = ethernetNames.length ? asRows(await this.withApi((api) => api.write("/interface/ethernet/monitor", [
        `=numbers=${ethernetNames.join(",")}`,
        "=once="
      ]))) : [];
      const interfaceRowsByName = new Map(routerInterfaces.map((row) => [typeof row.name === "string" ? row.name : "", row]).filter(([name]) => Boolean(name)));
      const interfaceNamesById = new Map(routerInterfaces.map((row) => [typeof row[".id"] === "string" ? row[".id"] : "", typeof row.name === "string" ? row.name : ""]).filter(([id, name]) => Boolean(id) && Boolean(name)));
      const speedEntries = ethernetInterfaces.map((row) => [
        typeof row.name === "string" ? row.name : "",
        parseInterfaceSpeedBps(row["actual-speed"]) || parseInterfaceSpeedBps(row.speed)
      ]).filter((entry) => Boolean(entry[0]) && typeof entry[1] === "number");
      const speedByName = new Map(speedEntries);
      for (const row of monitoredEthernetInterfaces) {
        const name = typeof row.name === "string" ? row.name : "";
        const speed = parseInterfaceSpeedBps(row.rate);
        if (name && typeof speed === "number") speedByName.set(name, speed);
      }
      const vlanParentByName = extractVlanParentInterfaces(vlanInterfaces, interfaceNamesById);
      const bridgePortsByName = extractBridgePortInterfaces(bridgePorts);
      const interfaceRoles = plan.roleSources.map((role) => {
        const row = interfaceRowsByName.get(role.name);
        const routerOsId = typeof (row == null ? void 0 : row[".id"]) === "string" ? row[".id"] : void 0;
        return {
          ...role,
          routerOsId,
          ifIndex: routerOsIdToIfIndex(routerOsId),
          speedBps: resolveInterfaceSpeedBps(role.name, speedByName, vlanParentByName, bridgePortsByName)
        };
      });
      if (!plan.interfaces.length) {
        return {
          collector: { ...collector, version: targetVersion },
          ...plan,
          interfaceRoles,
          targetAction: "unchanged",
          warning: "Nie wykryto interfejs\xF3w DHCP ani aktywnego uplinku bramy domy\u015Blnej"
        };
      }
      await this.withApi((api) => api.write("/ip/traffic-flow/set", [
        "=enabled=yes",
        "=active-flow-timeout=1m",
        "=inactive-flow-timeout=15s",
        `=interfaces=${plan.interfaces.join(",")}`
      ]));
      let ipfixAction = "skipped";
      let ipfixError;
      if (targetVersion === "ipfix") {
        try {
          await this.withApi((api) => api.write("/ip/traffic-flow/ipfix/set", [
            "=bytes=yes",
            "=packets=yes",
            "=src-address=yes",
            "=dst-address=yes",
            "=src-port=yes",
            "=dst-port=yes",
            "=protocol=yes",
            "=tos=yes",
            "=tcp-flags=yes",
            "=first-forwarded=yes",
            "=last-forwarded=yes",
            "=in-interface=yes",
            "=out-interface=yes",
            "=src-mac-address=yes",
            "=dst-mac-address=yes",
            "=nat-src-address=yes",
            "=nat-dst-address=yes",
            "=nat-src-port=yes",
            "=nat-dst-port=yes"
          ]));
          ipfixAction = "configured";
        } catch (error) {
          ipfixAction = "failed";
          ipfixError = error instanceof Error ? error.message : String(error);
        }
      }
      const targets = asRows(await this.withApi((api) => api.write("/ip/traffic-flow/target/print")));
      const existingTarget = targets.find(
        (row) => row["dst-address"] === collector.address && String(row.port) === String(collector.port)
      );
      let targetAction = "created";
      const staleTargets = targets.filter(
        (row) => row["dst-address"] !== collector.address && String(row.port) === String(collector.port) && row.disabled !== "true" && typeof row[".id"] === "string"
      );
      if (existingTarget && typeof existingTarget[".id"] === "string") {
        await this.withApi((api) => api.write("/ip/traffic-flow/target/set", [
          `=.id=${existingTarget[".id"]}`,
          `=dst-address=${collector.address}`,
          `=port=${collector.port}`,
          `=version=${targetVersion}`,
          "=disabled=no"
        ]));
        targetAction = "updated";
      } else {
        await this.withApi((api) => api.write("/ip/traffic-flow/target/add", [
          `=dst-address=${collector.address}`,
          `=port=${collector.port}`,
          `=version=${targetVersion}`,
          "=disabled=no"
        ]));
      }
      for (const target of staleTargets) {
        await this.withApi((api) => api.write("/ip/traffic-flow/target/set", [
          `=.id=${target[".id"]}`,
          "=disabled=yes"
        ]));
      }
      return {
        collector: { ...collector, version: targetVersion },
        ...plan,
        interfaceRoles,
        ipfixAction,
        ipfixError,
        targetAction,
        staleTargetsDisabled: staleTargets.map((target) => `${target["dst-address"] || "unknown"}:${target.port || collector.port}`).filter(Boolean),
        raw: {
          dhcpServers,
          bridgePorts,
          routes,
          routerInterfaces,
          vlanInterfaces,
          ethernetInterfaces,
          monitoredEthernetInterfaces
        }
      };
    });
  }
  async getCommandTree() {
    return unsupportedCheck("command-tree");
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
class MockNetworkDriver {
  constructor() {
    __publicField(this, "code", "mock");
  }
  async ping(target) {
    return { name: "ping", status: "ok", data: [{ address: target, status: "UP", time: "100us", size: "56" }] };
  }
  async arpPing(target) {
    return { name: "arp-ping", status: "ok", data: [{ address: target, status: "UP", time: "120us", interface: "bridge1" }] };
  }
  async getDhcpLease(macAddress) {
    return {
      name: "dhcp-lease",
      status: "ok",
      data: { macAddress, address: "10.0.0.50", status: "bound", lastSeen: "1h20m" }
    };
  }
  async getBridgeHost(macAddress) {
    return { name: "bridge-host", status: "ok", data: [{ macAddress, interface: "ether1", bridge: "bridge1" }] };
  }
  async getSwitchFdb(macAddress) {
    return { name: "switch-fdb", status: "ok", data: [{ macAddress, port: "ether1", vlanId: "100" }] };
  }
  async getLeases() {
    return [{
      id: "*1",
      address: "10.0.0.50",
      macAddress: "AA:BB:CC:DD:EE:FF",
      comment: "100 Kowalski Mic1",
      rateLimit: "300M/1000M",
      status: "bound",
      server: "dhcp-main",
      interface: "bridge1"
    }];
  }
  async getActiveUsers() {
    return {
      totalLeases: 1,
      candidateLeases: 1,
      activeUsers: [{
        macAddress: "AA:BB:CC:DD:EE:FF",
        ipAddress: "10.0.0.50",
        server: "dhcp-main",
        serverInterface: "bridge1",
        evidence: ["arp", "bridge-host"]
      }],
      evidenceCounts: {
        arp: 1,
        bridgeHost: 1,
        switchFdb: 0
      }
    };
  }
  async getNetworks() {
    return [{ cidr: "10.0.0.0/24", gateway: "10.0.0.1", comment: "LAN main" }];
  }
  async getOnus(_options = {}) {
    return [{ oltPort: "1", onuId: "5", status: "Active", serialNumber: "HALN08196530", uptime: "16:05:55:37", signalRx: "-20.10 dBm" }];
  }
  async getOnuInfo(oltPort, onuId) {
    return {
      name: "onu-info",
      status: "ok",
      data: { oltPort, onuId, status: "Active", serialNumber: "HALN08196530", uptime: "16:05:55:37", signalRx: "-20.10 dBm" }
    };
  }
  async getOnuMacTable(oltPort, onuId) {
    return [
      { oltPort, onuId, macAddress: "AA:BB:CC:DD:EE:FF", vlanId: "100", status: "dynamic" },
      { oltPort, onuId, macAddress: "00:11:22:33:44:55", vlanId: "400", status: "dynamic" }
    ];
  }
  async getOnuIpHosts(oltPort, onuId) {
    return [{
      oltPort,
      onuId,
      hostId: "1",
      ipOption: "DHCP",
      macAddress: "00:11:22:33:44:55",
      currentIp: "10.40.0.10",
      currentMask: "255.255.0.0",
      currentGateway: "10.40.0.1",
      hostName: "IPHOST: WWW/XML/TR069"
    }];
  }
  async upsertDhcpLease(payload) {
    return { name: "sync-lease", status: "ok", data: payload };
  }
  async configureNetflow(config) {
    return {
      name: "netflow-config",
      status: "ok",
      data: {
        collector: { address: config.collector.split(":")[0], port: 2055, version: config.version || "ipfix" },
        dhcpInterfaces: ["bridge1"],
        uplinkInterfaces: ["ether1"],
        interfaces: ["bridge1", "ether1"],
        targetAction: "unchanged"
      }
    };
  }
  async getCommandTree() {
    return {
      name: "command-tree",
      status: "unsupported",
      message: "Driver mock nie udost\u0119pnia drzewa komend"
    };
  }
}

function createNetworkDriver(driverCode, equipment) {
  switch (driverCode) {
    case "mikrotik_v7":
      return new MikrotikDriver(equipment);
    case "dasan_nos":
      return new DasanDriver(equipment);
    case "mock":
    case "snmp_generic":
    case "ssh_generic":
    case "http_api":
    case "tr069":
    case "netconf":
    default:
      return new MockNetworkDriver();
  }
}

const ENCRYPTION_PREFIX = "v1";
const KEY_SALT = "netcoreops-access-profile";
function getSecretKey() {
  const source = process.env.NETCOREOPS_SECRET_KEY || "netcoreops-local-development-key";
  return scryptSync(source, KEY_SALT, 32);
}
function encryptSecret(value) {
  if (!value) return value != null ? value : null;
  if (value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(":");
}
function decryptSecret(value) {
  if (!value) return value != null ? value : null;
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;
  const [, ivValue, tagValue, encryptedValue] = value.split(":");
  if (!ivValue || !tagValue || !encryptedValue) return null;
  const decipher = createDecipheriv("aes-256-gcm", getSecretKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
function encryptAccessProfileSecrets(profile) {
  return {
    ...profile,
    passwordEncrypted: encryptSecret(profile.passwordEncrypted),
    snmpCommunityEncrypted: encryptSecret(profile.snmpCommunityEncrypted),
    apiTokenEncrypted: encryptSecret(profile.apiTokenEncrypted),
    sshKeyEncrypted: encryptSecret(profile.sshKeyEncrypted)
  };
}
function decryptAccessProfileSecrets(profile) {
  return {
    ...profile,
    passwordEncrypted: decryptSecret(profile.passwordEncrypted),
    snmpCommunityEncrypted: decryptSecret(profile.snmpCommunityEncrypted),
    apiTokenEncrypted: decryptSecret(profile.apiTokenEncrypted),
    sshKeyEncrypted: decryptSecret(profile.sshKeyEncrypted)
  };
}

async function loadManagedEquipment(equipmentId) {
  return await db.query.networkEquipment.findFirst({
    where: eq(networkEquipment.id, equipmentId),
    with: {
      accessProfile: true,
      managementDriver: true,
      parentEquipment: {
        with: {
          accessProfile: true,
          managementDriver: true
        }
      }
    }
  });
}
function toDriverEquipment(equipment) {
  return {
    id: equipment.id,
    inventoryId: equipment.inventoryId,
    hostname: equipment.hostname,
    managementIp: equipment.managementIp,
    managementPort: equipment.managementPort,
    managementProtocol: equipment.managementProtocol,
    macAddress: equipment.macAddress,
    serialNumber: equipment.serialNumber,
    onuPort: equipment.onuPort,
    onuId: equipment.onuId,
    accessProfile: equipment.accessProfile ? decryptAccessProfileSecrets(equipment.accessProfile) : null
  };
}
async function getDriverForEquipment(equipmentId) {
  var _a;
  const equipment = await loadManagedEquipment(equipmentId);
  if (!equipment) throw createError$1({ statusCode: 404, statusMessage: "Urz\u0105dzenie nie istnieje" });
  const driverCode = ((_a = equipment.managementDriver) == null ? void 0 : _a.code) || equipment.managementProtocol || "mock";
  return {
    equipment,
    driverCode,
    driver: createNetworkDriver(driverCode, toDriverEquipment(equipment))
  };
}

function isSevenDigitCode(value) {
  return typeof value === "string" && /^[0-9]{7}$/.test(value);
}
function pushIssue(report, severity, entity, entityId, code, message) {
  report[severity === "error" ? "errors" : "warnings"].push({
    severity,
    entity,
    entityId,
    code,
    message
  });
}
function validatePitReadiness(dataset) {
  const report = { errors: [], warnings: [] };
  for (const node of dataset.nodes) {
    if (!node.terytAreaId && !node.terytCode) {
      pushIssue(report, "warning", "networkNodes", node.id, "NODE_WITHOUT_TERYT", `W\u0119ze\u0142 ${node.inventoryId} nie ma powi\u0105zania TERYT.`);
    }
    if (!node.simcLocalityId && !node.simcCode) {
      pushIssue(report, "warning", "networkNodes", node.id, "NODE_WITHOUT_SIMC", `W\u0119ze\u0142 ${node.inventoryId} nie ma powi\u0105zania SIMC.`);
    }
    if (node.terytCode && !isSevenDigitCode(node.terytCode)) {
      pushIssue(report, "error", "networkNodes", node.id, "INVALID_NODE_TERYT", `W\u0119ze\u0142 ${node.inventoryId} ma niepoprawny kod TERYT.`);
    }
    if (node.simcCode && !isSevenDigitCode(node.simcCode)) {
      pushIssue(report, "error", "networkNodes", node.id, "INVALID_NODE_SIMC", `W\u0119ze\u0142 ${node.inventoryId} ma niepoprawny kod SIMC.`);
    }
  }
  for (const line of dataset.lines) {
    if (!line.nodeStartId || !line.nodeEndId) {
      pushIssue(report, "error", "networkLines", line.id, "LINE_WITHOUT_ENDPOINTS", `Linia ${line.inventoryId} musi mie\u0107 oba w\u0119z\u0142y ko\u0144cowe.`);
    }
  }
  for (const item of dataset.equipment) {
    if (item.equipmentRole === "CLIENT_PE" && !item.nodeId) {
      pushIssue(report, "error", "networkEquipment", item.id, "CPE_WITHOUT_NODE", `Punkt elastyczno\u015Bci ${item.inventoryId} musi by\u0107 zasilany z jednego w\u0119z\u0142a.`);
    }
  }
  for (const service of dataset.services) {
    if (!service.customerId) {
      pushIssue(report, "error", "customerServices", service.id, "SERVICE_WITHOUT_CUSTOMER", "Us\u0142uga musi by\u0107 przypisana do klienta.");
    }
    if (!service.profileId) {
      pushIssue(report, "error", "customerServices", service.id, "SERVICE_WITHOUT_PROFILE", "Us\u0142uga musi mie\u0107 profil dost\u0119powy.");
    }
    if (service.serviceAddressTeryt && !isSevenDigitCode(service.serviceAddressTeryt)) {
      pushIssue(report, "error", "customerServices", service.id, "INVALID_SERVICE_TERYT", "Adres us\u0142ugi ma niepoprawny kod TERYT.");
    }
    if (!service.serviceTerytAreaId && !service.serviceAddressTeryt) {
      pushIssue(report, "warning", "customerServices", service.id, "SERVICE_WITHOUT_TERYT", "Us\u0142uga nie ma powi\u0105zania TERYT w definicjach adresowych.");
    }
    if (!service.serviceSimcLocalityId) {
      pushIssue(report, "warning", "customerServices", service.id, "SERVICE_WITHOUT_SIMC", "Us\u0142uga nie ma powi\u0105zania SIMC w definicjach adresowych.");
    }
  }
  return report;
}
function formatPitValidationReport(report) {
  return {
    ...report,
    summary: {
      errors: report.errors.length,
      warnings: report.warnings.length,
      readyForExport: report.errors.length === 0
    }
  };
}

const collections = {
  'lucide': () => import('../_/icons.mjs').then(m => m.default),
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _hUMM8i = defineCachedEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url)
    return createError$1({ status: 400, message: "Invalid icon request" });
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName ? await collections[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = url.searchParams.get("icons")?.split(",");
  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons
      );
      consola.debug(`[Icon] serving ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
      return data;
    }
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL("./" + basename(url.pathname) + url.search, apiEndPoint);
    consola.debug(`[Icon] fetching ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(getQuery(event).icons || "");
    return `${collection}_${icons.split(",")[0]}_${icons.length}_${hash$1(icons)}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const _SxA8c9 = defineEventHandler(() => {});

const _lazy_ssPBjN = () => import('../routes/api/account/me.get.mjs');
const _lazy_NMP5De = () => import('../routes/api/addresses/search.get.mjs');
const _lazy_KIkJtS = () => import('../routes/api/alerts/gpon-rx.get.mjs');
const _lazy_qHToSF = () => import('../routes/api/auth/login.post.mjs');
const _lazy_Z8kS9Z = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_5X8mF7 = () => import('../routes/api/auth/session.get.mjs');
const _lazy_uvnRHh = () => import('../routes/api/automation/scripts/_id_.delete.mjs');
const _lazy_PufHFw = () => import('../routes/api/automation/scripts/_id_.patch.mjs');
const _lazy_aHy0Lm = () => import('../routes/api/automation/scripts/_id/render.post.mjs');
const _lazy_x2KSA1 = () => import('../routes/api/automation/scripts/_id/run.post.mjs');
const _lazy_5BOsLW = () => import('../routes/api/automation/index.get.mjs');
const _lazy_p9TnQt = () => import('../routes/api/automation/index.post.mjs');
const _lazy_XCTeK1 = () => import('../routes/api/automation/variables/_id_.delete.mjs');
const _lazy_OvYCce = () => import('../routes/api/automation/variables/_id_.patch.mjs');
const _lazy_qIel3n = () => import('../routes/api/automation/index.get2.mjs');
const _lazy_9oTJEI = () => import('../routes/api/automation/index.post2.mjs');
const _lazy_lMbilJ = () => import('../routes/api/automation/variables/sources.get.mjs');
const _lazy_fILUkM = () => import('../routes/api/billing/assignments/_id_.delete.mjs').then(function (n) { return n.a; });
const _lazy_bMyZnF = () => import('../routes/api/billing/assignments/_id_.patch.mjs').then(function (n) { return n.a; });
const _lazy_v4Q0sN = () => import('../routes/api/billing/index.get.mjs').then(function (n) { return n.a; });
const _lazy_MVPiVA = () => import('../routes/api/billing/index.post.mjs').then(function (n) { return n.a; });
const _lazy_cAXe4l = () => import('../routes/api/billing/assignments/_id_.delete.mjs').then(function (n) { return n._; });
const _lazy_VPSt90 = () => import('../routes/api/billing/assignments/_id_.patch.mjs').then(function (n) { return n._; });
const _lazy_Sag8YM = () => import('../routes/api/billing/index.get.mjs').then(function (n) { return n.i; });
const _lazy_pSFvEi = () => import('../routes/api/billing/index.post.mjs').then(function (n) { return n.i; });
const _lazy_HSL4n4 = () => import('../routes/api/billing/tariffs/_id_.delete.mjs');
const _lazy_BIqMmI = () => import('../routes/api/billing/tariffs/_id_.patch.mjs');
const _lazy_EyYJO8 = () => import('../routes/api/billing/index.get2.mjs');
const _lazy_eD_qlJ = () => import('../routes/api/billing/index.post2.mjs');
const _lazy_Kyr0DV = () => import('../routes/api/crm/customer-devices/_id_.delete.mjs');
const _lazy_3QZhWr = () => import('../routes/api/crm/customer-devices/_id_.patch.mjs');
const _lazy_aWnRXf = () => import('../routes/api/crm/index.get.mjs');
const _lazy_J9ni4K = () => import('../routes/api/crm/index.post.mjs');
const _lazy_6r4WZK = () => import('../routes/api/crm/customers/_id_.delete.mjs');
const _lazy_PmwBos = () => import('../routes/api/crm/customers/_id_.patch.mjs');
const _lazy_Lv4MyV = () => import('../routes/api/crm/index.get2.mjs');
const _lazy_EcmK7D = () => import('../routes/api/crm/index.post2.mjs');
const _lazy_1bFGVR = () => import('../routes/api/crm/services/_id_.delete.mjs');
const _lazy_WaDYqD = () => import('../routes/api/crm/services/_id_.patch.mjs');
const _lazy_pjuMlg = () => import('../routes/api/crm/index.post3.mjs');
const _lazy_AYfSlp = () => import('../routes/api/customers.mjs');
const _lazy_sXIf2v = () => import('../routes/api/dashboard/summary.get.mjs');
const _lazy_xxY1g7 = () => import('../routes/api/diagnostics/customer-devices/_id/check.post.mjs');
const _lazy_vl8DSy = () => import('../routes/api/diagnostics/customer-devices/_id/olt-lookup.post.mjs');
const _lazy_bkptfw = () => import('../routes/api/diagnostics/customer-devices/_id/sync-lease.post.mjs');
const _lazy_XaK90e = () => import('../routes/api/diagnostics/equipment/_id/command-tree.post.mjs');
const _lazy_B8PFoZ = () => import('../routes/api/diagnostics/equipment/_id/dhcp-leases.get.mjs');
const _lazy_xJr_vN = () => import('../routes/api/diagnostics/equipment/_id/mac-check.post.mjs');
const _lazy_PY_IG9 = () => import('../routes/api/diagnostics/equipment/_id/mikrotik-check.post.mjs');
const _lazy__3kBIW = () => import('../routes/api/diagnostics/equipment/_id/netflow-config.post.mjs');
const _lazy_H9gpiD = () => import('../routes/api/diagnostics/equipment/_id/onu-ip-host.post.mjs');
const _lazy_4c21Dv = () => import('../routes/api/diagnostics/runs/_id_.delete.mjs');
const _lazy_8OyXaU = () => import('../routes/api/ftth/imports/dasan/_equipmentId/ip-hosts.post.mjs');
const _lazy_ugGNsF = () => import('../routes/api/ftth/imports/dasan/_equipmentId/jobs.post.mjs');
const _lazy_6SAPTi = () => import('../routes/api/ftth/imports/dasan/_equipmentId/mac-map.post.mjs');
const _lazy_CEpgAY = () => import('../routes/api/ftth/imports/dasan/_equipmentId/onus.post.mjs');
const _lazy_p5cEbe = () => import('../routes/api/ftth/imports/jobs/_jobId_.get.mjs');
const _lazy_g1X4Fe = () => import('../routes/api/ftth/imports/options.get.mjs');
const _lazy_ucMctd = () => import('../routes/api/ftth/index.get.mjs');
const _lazy_s6SfMs = () => import('../routes/api/ftth/index.get2.mjs');
const _lazy_oiODLQ = () => import('../routes/api/ftth/onuses/_id/link-customer.post.mjs');
const _lazy_ZdchEo = () => import('../routes/api/ftth/onuses/_id/link-equipment.post.mjs');
const _lazy_RdlXF2 = () => import('../routes/api/ftth/index.get3.mjs');
const _lazy_NUuxiL = () => import('../routes/api/ftth/index.get4.mjs');
const _lazy_E2Ka_e = () => import('../routes/api/ftth/index.get5.mjs');
const _lazy_22DGJv = () => import('../routes/api/import/dasan/_equipmentId/mac-map.post.mjs');
const _lazy_8Bq04x = () => import('../routes/api/import/dasan/_equipmentId/onus.post.mjs');
const _lazy_uE2FYc = () => import('../routes/api/import/mikrotik/_equipmentId/config.post.mjs');
const _lazy_AHEH17 = () => import('../routes/api/import/mikrotik/_equipmentId/leases.post.mjs');
const _lazy_8C0rjJ = () => import('../routes/api/import/mikrotik/_equipmentId/networks.post.mjs');
const _lazy_w_5FeD = () => import('../routes/api/import/runs/_id_.delete.mjs');
const _lazy_YX8fjK = () => import('../routes/api/mails.mjs');
const _lazy_WEVbbo = () => import('../routes/api/members.mjs');
const _lazy_unwMiQ = () => import('../routes/api/netflow/flows.get.mjs');
const _lazy_q9c7EA = () => import('../routes/api/netflow/ingest-aggregate.post.mjs');
const _lazy_jGS4s8 = () => import('../routes/api/network/index.post.mjs');
const _lazy_3jgWlZ = () => import('../routes/api/network/access-profiles/_id_.delete.mjs');
const _lazy_P4tq61 = () => import('../routes/api/network/access-profiles/_id_.patch.mjs');
const _lazy_Kt75aX = () => import('../routes/api/network/index.get.mjs');
const _lazy_yCDBEn = () => import('../routes/api/network/index.post2.mjs');
const _lazy_LKfMEW = () => import('../routes/api/network/equipment/_id_.delete.mjs');
const _lazy_C_UPnb = () => import('../routes/api/network/equipment/_id_.patch.mjs');
const _lazy_PC7opZ = () => import('../routes/api/network/index.get2.mjs');
const _lazy_RFJhEV = () => import('../routes/api/network/index.post3.mjs');
const _lazy_AOCJnk = () => import('../routes/api/network/import-options.get.mjs');
const _lazy_qUKf0A = () => import('../routes/api/network/lines/_id_.delete.mjs');
const _lazy_xdLjn6 = () => import('../routes/api/network/lines/_id_.patch.mjs');
const _lazy_r92p03 = () => import('../routes/api/network/index.get3.mjs');
const _lazy_snHrwo = () => import('../routes/api/network/index.post4.mjs');
const _lazy_V6rITM = () => import('../routes/api/network/nodes/_id_.delete.mjs');
const _lazy_B6Kbng = () => import('../routes/api/network/nodes/_id_.patch.mjs');
const _lazy_j7DSOv = () => import('../routes/api/network/index.get4.mjs');
const _lazy_B2loxR = () => import('../routes/api/network/index.post5.mjs');
const _lazy_bt8U8m = () => import('../routes/api/notifications.mjs');
const _lazy_Qwx_3r = () => import('../routes/api/pit/export.get.mjs');
const _lazy_rD1ePP = () => import('../routes/api/pit/validation.get.mjs');
const _lazy_MbE4Zk = () => import('../routes/api/search.get.mjs');
const _lazy_4xeVgc = () => import('../routes/api/system/dictionaries.get.mjs');
const _lazy_vw6E0p = () => import('../routes/api/system/dictionaries/import.post.mjs');
const _lazy_cml63U = () => import('../routes/api/system/options.get.mjs');
const _lazy_TspaSc = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _BpYFM2, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _LlRz7B, lazy: false, middleware: true, method: undefined },
  { route: '/api/account/me', handler: _lazy_ssPBjN, lazy: true, middleware: false, method: "get" },
  { route: '/api/addresses/search', handler: _lazy_NMP5De, lazy: true, middleware: false, method: "get" },
  { route: '/api/alerts/gpon-rx', handler: _lazy_KIkJtS, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/login', handler: _lazy_qHToSF, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_Z8kS9Z, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/session', handler: _lazy_5X8mF7, lazy: true, middleware: false, method: "get" },
  { route: '/api/automation/scripts/:id', handler: _lazy_uvnRHh, lazy: true, middleware: false, method: "delete" },
  { route: '/api/automation/scripts/:id', handler: _lazy_PufHFw, lazy: true, middleware: false, method: "patch" },
  { route: '/api/automation/scripts/:id/render', handler: _lazy_aHy0Lm, lazy: true, middleware: false, method: "post" },
  { route: '/api/automation/scripts/:id/run', handler: _lazy_x2KSA1, lazy: true, middleware: false, method: "post" },
  { route: '/api/automation/scripts', handler: _lazy_5BOsLW, lazy: true, middleware: false, method: "get" },
  { route: '/api/automation/scripts', handler: _lazy_p9TnQt, lazy: true, middleware: false, method: "post" },
  { route: '/api/automation/variables/:id', handler: _lazy_XCTeK1, lazy: true, middleware: false, method: "delete" },
  { route: '/api/automation/variables/:id', handler: _lazy_OvYCce, lazy: true, middleware: false, method: "patch" },
  { route: '/api/automation/variables', handler: _lazy_qIel3n, lazy: true, middleware: false, method: "get" },
  { route: '/api/automation/variables', handler: _lazy_9oTJEI, lazy: true, middleware: false, method: "post" },
  { route: '/api/automation/variables/sources', handler: _lazy_lMbilJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/billing/assignments/:id', handler: _lazy_fILUkM, lazy: true, middleware: false, method: "delete" },
  { route: '/api/billing/assignments/:id', handler: _lazy_bMyZnF, lazy: true, middleware: false, method: "patch" },
  { route: '/api/billing/assignments', handler: _lazy_v4Q0sN, lazy: true, middleware: false, method: "get" },
  { route: '/api/billing/assignments', handler: _lazy_MVPiVA, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/subscriptions/:id', handler: _lazy_cAXe4l, lazy: true, middleware: false, method: "delete" },
  { route: '/api/billing/subscriptions/:id', handler: _lazy_VPSt90, lazy: true, middleware: false, method: "patch" },
  { route: '/api/billing/subscriptions', handler: _lazy_Sag8YM, lazy: true, middleware: false, method: "get" },
  { route: '/api/billing/subscriptions', handler: _lazy_pSFvEi, lazy: true, middleware: false, method: "post" },
  { route: '/api/billing/tariffs/:id', handler: _lazy_HSL4n4, lazy: true, middleware: false, method: "delete" },
  { route: '/api/billing/tariffs/:id', handler: _lazy_BIqMmI, lazy: true, middleware: false, method: "patch" },
  { route: '/api/billing/tariffs', handler: _lazy_EyYJO8, lazy: true, middleware: false, method: "get" },
  { route: '/api/billing/tariffs', handler: _lazy_eD_qlJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/crm/customer-devices/:id', handler: _lazy_Kyr0DV, lazy: true, middleware: false, method: "delete" },
  { route: '/api/crm/customer-devices/:id', handler: _lazy_3QZhWr, lazy: true, middleware: false, method: "patch" },
  { route: '/api/crm/customer-devices', handler: _lazy_aWnRXf, lazy: true, middleware: false, method: "get" },
  { route: '/api/crm/customer-devices', handler: _lazy_J9ni4K, lazy: true, middleware: false, method: "post" },
  { route: '/api/crm/customers/:id', handler: _lazy_6r4WZK, lazy: true, middleware: false, method: "delete" },
  { route: '/api/crm/customers/:id', handler: _lazy_PmwBos, lazy: true, middleware: false, method: "patch" },
  { route: '/api/crm/customers', handler: _lazy_Lv4MyV, lazy: true, middleware: false, method: "get" },
  { route: '/api/crm/customers', handler: _lazy_EcmK7D, lazy: true, middleware: false, method: "post" },
  { route: '/api/crm/services/:id', handler: _lazy_1bFGVR, lazy: true, middleware: false, method: "delete" },
  { route: '/api/crm/services/:id', handler: _lazy_WaDYqD, lazy: true, middleware: false, method: "patch" },
  { route: '/api/crm/services', handler: _lazy_pjuMlg, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers', handler: _lazy_AYfSlp, lazy: true, middleware: false, method: undefined },
  { route: '/api/dashboard/summary', handler: _lazy_sXIf2v, lazy: true, middleware: false, method: "get" },
  { route: '/api/diagnostics/customer-devices/:id/check', handler: _lazy_xxY1g7, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/customer-devices/:id/olt-lookup', handler: _lazy_vl8DSy, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/customer-devices/:id/sync-lease', handler: _lazy_bkptfw, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/equipment/:id/command-tree', handler: _lazy_XaK90e, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/equipment/:id/dhcp-leases', handler: _lazy_B8PFoZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/diagnostics/equipment/:id/mac-check', handler: _lazy_xJr_vN, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/equipment/:id/mikrotik-check', handler: _lazy_PY_IG9, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/equipment/:id/netflow-config', handler: _lazy__3kBIW, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/equipment/:id/onu-ip-host', handler: _lazy_H9gpiD, lazy: true, middleware: false, method: "post" },
  { route: '/api/diagnostics/runs/:id', handler: _lazy_4c21Dv, lazy: true, middleware: false, method: "delete" },
  { route: '/api/ftth/imports/dasan/:equipmentId/ip-hosts', handler: _lazy_8OyXaU, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/imports/dasan/:equipmentId/jobs', handler: _lazy_ugGNsF, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/imports/dasan/:equipmentId/mac-map', handler: _lazy_6SAPTi, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/imports/dasan/:equipmentId/onus', handler: _lazy_CEpgAY, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/imports/jobs/:jobId', handler: _lazy_p5cEbe, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/imports/options', handler: _lazy_g1X4Fe, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/mac-map', handler: _lazy_ucMctd, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/olts', handler: _lazy_s6SfMs, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/onuses/:id/link-customer', handler: _lazy_oiODLQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/onuses/:id/link-equipment', handler: _lazy_ZdchEo, lazy: true, middleware: false, method: "post" },
  { route: '/api/ftth/onuses', handler: _lazy_RdlXF2, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/pons', handler: _lazy_NUuxiL, lazy: true, middleware: false, method: "get" },
  { route: '/api/ftth/transparent-links', handler: _lazy_E2Ka_e, lazy: true, middleware: false, method: "get" },
  { route: '/api/import/dasan/:equipmentId/mac-map', handler: _lazy_22DGJv, lazy: true, middleware: false, method: "post" },
  { route: '/api/import/dasan/:equipmentId/onus', handler: _lazy_8Bq04x, lazy: true, middleware: false, method: "post" },
  { route: '/api/import/mikrotik/:equipmentId/config', handler: _lazy_uE2FYc, lazy: true, middleware: false, method: "post" },
  { route: '/api/import/mikrotik/:equipmentId/leases', handler: _lazy_AHEH17, lazy: true, middleware: false, method: "post" },
  { route: '/api/import/mikrotik/:equipmentId/networks', handler: _lazy_8C0rjJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/import/runs/:id', handler: _lazy_w_5FeD, lazy: true, middleware: false, method: "delete" },
  { route: '/api/mails', handler: _lazy_YX8fjK, lazy: true, middleware: false, method: undefined },
  { route: '/api/members', handler: _lazy_WEVbbo, lazy: true, middleware: false, method: undefined },
  { route: '/api/netflow/flows', handler: _lazy_unwMiQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/netflow/ingest-aggregate', handler: _lazy_q9c7EA, lazy: true, middleware: false, method: "post" },
  { route: '/api/network/access-profile-bindings', handler: _lazy_jGS4s8, lazy: true, middleware: false, method: "post" },
  { route: '/api/network/access-profiles/:id', handler: _lazy_3jgWlZ, lazy: true, middleware: false, method: "delete" },
  { route: '/api/network/access-profiles/:id', handler: _lazy_P4tq61, lazy: true, middleware: false, method: "patch" },
  { route: '/api/network/access-profiles', handler: _lazy_Kt75aX, lazy: true, middleware: false, method: "get" },
  { route: '/api/network/access-profiles', handler: _lazy_yCDBEn, lazy: true, middleware: false, method: "post" },
  { route: '/api/network/equipment/:id', handler: _lazy_LKfMEW, lazy: true, middleware: false, method: "delete" },
  { route: '/api/network/equipment/:id', handler: _lazy_C_UPnb, lazy: true, middleware: false, method: "patch" },
  { route: '/api/network/equipment', handler: _lazy_PC7opZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/network/equipment', handler: _lazy_RFJhEV, lazy: true, middleware: false, method: "post" },
  { route: '/api/network/import-options', handler: _lazy_AOCJnk, lazy: true, middleware: false, method: "get" },
  { route: '/api/network/lines/:id', handler: _lazy_qUKf0A, lazy: true, middleware: false, method: "delete" },
  { route: '/api/network/lines/:id', handler: _lazy_xdLjn6, lazy: true, middleware: false, method: "patch" },
  { route: '/api/network/lines', handler: _lazy_r92p03, lazy: true, middleware: false, method: "get" },
  { route: '/api/network/lines', handler: _lazy_snHrwo, lazy: true, middleware: false, method: "post" },
  { route: '/api/network/nodes/:id', handler: _lazy_V6rITM, lazy: true, middleware: false, method: "delete" },
  { route: '/api/network/nodes/:id', handler: _lazy_B6Kbng, lazy: true, middleware: false, method: "patch" },
  { route: '/api/network/nodes', handler: _lazy_j7DSOv, lazy: true, middleware: false, method: "get" },
  { route: '/api/network/nodes', handler: _lazy_B2loxR, lazy: true, middleware: false, method: "post" },
  { route: '/api/notifications', handler: _lazy_bt8U8m, lazy: true, middleware: false, method: undefined },
  { route: '/api/pit/export', handler: _lazy_Qwx_3r, lazy: true, middleware: false, method: "get" },
  { route: '/api/pit/validation', handler: _lazy_rD1ePP, lazy: true, middleware: false, method: "get" },
  { route: '/api/search', handler: _lazy_MbE4Zk, lazy: true, middleware: false, method: "get" },
  { route: '/api/system/dictionaries', handler: _lazy_4xeVgc, lazy: true, middleware: false, method: "get" },
  { route: '/api/system/dictionaries/import', handler: _lazy_vw6E0p, lazy: true, middleware: false, method: "post" },
  { route: '/api/system/options', handler: _lazy_cml63U, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/api/_nuxt_icon/:collection', handler: _hUMM8i, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/api/dashboard/**', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/api/system/**', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/api/crm/**', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/login', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/settings/**', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/login/_payload.json', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_TspaSc, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = options || {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { ftthOlts as $, AUTH_COOKIE_NAME as A, updateTariffSchema as B, createTariffSchema as C, archiveSchema as D, customerDevices as E, updateCustomerDeviceSchema as F, diagnosticRuns as G, createCustomerDeviceSchema as H, customers as I, updateCustomerSchema as J, resolveAddressIds as K, createCustomerSchema as L, customerServices as M, updateServiceSchema as N, createServiceSchema as O, networkEquipment as P, networkNodes as Q, networkLines as R, ftthOnus as S, buildNetflowInterfaceRoleMaps as T, getDriverForEquipment as U, withDiagnosticPresentation as V, parseNetflowCollector as W, importModeSchema as X, compactImportSummary as Y, recordImportRun as Z, ftthPonPorts as _, getAuthConfig as a, getResponseStatus as a$, buildMikrotikLeaseActions as a0, ipNetworks as a1, importRuns as a2, eventHandler as a3, getRequestIP as a4, getHeader as a5, netflowInterfaceSamples as a6, createAccessProfileBindingSchema as a7, accessProfileDeviceBindings as a8, accessProfiles as a9, getRequestHeader as aA, upperFirst as aB, hasProtocol as aC, isScriptProtocol as aD, joinURL as aE, withQuery as aF, sanitizeStatusCode as aG, parseURL as aH, encodePath as aI, decodePath as aJ, parseQuery as aK, defuFn as aL, getContext as aM, withTrailingSlash as aN, withoutTrailingSlash as aO, $fetch$1 as aP, baseURL as aQ, executeAsync as aR, ftthOnuIpHosts as aS, getOrCreateOnuModelId as aT, ftthOnuMacs as aU, ftthTransparentLinks as aV, buildAssetsURL as aW, publicAssetsURL as aX, useRuntimeConfig as aY, useStorage as aZ, getResponseStatusText as a_, updateAccessProfileSchema as aa, encryptAccessProfileSecrets as ab, createAccessProfileSchema as ac, updateEquipmentSchema as ad, createEquipmentSchema as ae, updateLineSchema as af, resolveMediumTypeId as ag, createLineSchema as ah, updateNodeSchema as ai, createNodeSchema as aj, setHeader as ak, toCsv as al, formatPitValidationReport as am, validatePitReadiness as an, subscriptions as ao, importDictionariesSchema as ap, ukeMediumTypes as aq, ukeTechnologyTypes as ar, terytAreas as as, simcLocalities as at, ulicStreets as au, defu as av, isEqual as aw, hash$1 as ax, klona as ay, parse as az, setCookie as b, defineRenderHandler as b0, destr as b1, getRouteRules as b2, useNitroApp as b3, updateSubscriptionSchema as b4, createSubscriptionSchema as b5, nodeServer as b6, createError$1 as c, defineEventHandler as d, createAuthSessionToken as e, AUTH_MAX_AGE_SECONDS as f, getQuery as g, deleteCookie as h, validateAuthSessionToken as i, getCookie as j, getRouterParam as k, db as l, automationScripts as m, renderAutomationScriptSchema as n, renderAutomationScript as o, executeAutomationScript as p, createAutomationScriptSchema as q, readBody as r, searchAddresses as s, automationVariableDefinitions as t, updateAutomationScriptSchema as u, validateLocalLogin as v, updateAutomationVariableDefinitionSchema as w, createAutomationVariableDefinitionSchema as x, automationSourceCatalog as y, tariffs as z };

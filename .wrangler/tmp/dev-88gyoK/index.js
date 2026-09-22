var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-4nz0al/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, {
          headers: contentType ? { "Content-Type": contentType } : void 0
        })[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers) {
          if (++count3 > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibytes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/utils.js
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context2, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context2.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "QUERY"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    } else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else {
      return () => "";
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (exposeHeadersStr) {
      set("Access-Control-Expose-Headers", exposeHeadersStr);
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        c.res.headers.append("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) {
        set("Access-Control-Allow-Methods", allowMethods);
      }
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
        }
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/db/client.js
var DbClient = class {
  constructor(db) {
    this.db = db;
  }
  // --- CONFIG HELPER METHODS ---
  async getConfig(key, defaultValue = "") {
    try {
      const row = await this.db.prepare("SELECT value FROM configs WHERE key = ?").bind(key).first();
      return row ? row.value ?? defaultValue : defaultValue;
    } catch (e) {
      console.error(`Error getting config ${key}:`, e);
      return defaultValue;
    }
  }
  async setConfig(key, value) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare(
      `INSERT INTO configs (key, value, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(key, value, now, now).run();
  }
  async getAllConfigs() {
    const keys = [
      "active_gateway",
      "webapp_callback_url",
      "selcom_base_url",
      "selcom_api_key",
      "selcom_secret_key",
      "selcom_vendor",
      "azampay_base_url",
      "azampay_auth_base_url",
      "azampay_client_id",
      "azampay_client_secret",
      "azampay_app_name",
      "azampay_api_key"
    ];
    const result = await this.db.prepare("SELECT key, value FROM configs").all();
    const map = {};
    for (const k of keys) {
      map[k] = "";
    }
    if (result.results) {
      for (const row of result.results) {
        map[row.key] = row.value;
      }
    }
    return map;
  }
  // --- PAYMENT LOG HELPER METHODS ---
  async createPaymentLog(logData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const res = await this.db.prepare(
      `INSERT INTO payment_logs (external_reference, gateway_reference, gateway, amount, phone, status, raw_request, raw_response, callback_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      logData.external_reference,
      logData.gateway_reference || null,
      logData.gateway,
      logData.amount,
      logData.phone,
      logData.status || "pending",
      logData.raw_request ? JSON.stringify(logData.raw_request) : null,
      logData.raw_response ? JSON.stringify(logData.raw_response) : null,
      logData.callback_payload ? JSON.stringify(logData.callback_payload) : null,
      now,
      now
    ).run();
    return res.meta.last_row_id;
  }
  async updatePaymentLog(id, updateData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const fields = [];
    const values = [];
    if (updateData.gateway_reference !== void 0) {
      fields.push("gateway_reference = ?");
      values.push(updateData.gateway_reference);
    }
    if (updateData.status !== void 0) {
      fields.push("status = ?");
      values.push(updateData.status);
    }
    if (updateData.raw_response !== void 0) {
      fields.push("raw_response = ?");
      values.push(updateData.raw_response ? JSON.stringify(updateData.raw_response) : null);
    }
    if (updateData.callback_payload !== void 0) {
      fields.push("callback_payload = ?");
      values.push(updateData.callback_payload ? JSON.stringify(updateData.callback_payload) : null);
    }
    fields.push("updated_at = ?");
    values.push(now);
    values.push(id);
    await this.db.prepare(`UPDATE payment_logs SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  }
  async findPaymentLogByRef(externalReference, gateway = null) {
    let sql = "SELECT * FROM payment_logs WHERE external_reference = ?";
    const params = [externalReference];
    if (gateway) {
      sql += " AND gateway = ?";
      params.push(gateway);
    }
    sql += " ORDER BY id DESC LIMIT 1";
    const row = await this.db.prepare(sql).bind(...params).first();
    return this.parseLogItem(row);
  }
  async findPaymentLogById(id) {
    const row = await this.db.prepare("SELECT * FROM payment_logs WHERE id = ?").bind(id).first();
    return this.parseLogItem(row);
  }
  async getPaymentLogs({ search = "", gateway = "", status = "", page = 1, perPage = 10 }) {
    let whereClauses = [];
    let params = [];
    if (search) {
      whereClauses.push("(external_reference LIKE ? OR phone LIKE ? OR gateway_reference LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (gateway && gateway !== "all") {
      whereClauses.push("gateway = ?");
      params.push(gateway.toLowerCase());
    }
    if (status && status !== "all") {
      whereClauses.push("status = ?");
      params.push(status.toLowerCase());
    }
    const whereSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
    const countRow = await this.db.prepare(`SELECT COUNT(*) as total FROM payment_logs ${whereSql}`).bind(...params).first();
    const total = countRow ? countRow.total : 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const dataSql = `SELECT * FROM payment_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataResult = await this.db.prepare(dataSql).bind(...params, perPage, offset).all();
    const data = (dataResult.results || []).map((row) => this.parseLogItem(row));
    return {
      current_page: page,
      data,
      first_page_url: `?page=1`,
      from: total > 0 ? offset + 1 : null,
      last_page: lastPage,
      last_page_url: `?page=${lastPage}`,
      next_page_url: page < lastPage ? `?page=${page + 1}` : null,
      prev_page_url: page > 1 ? `?page=${page - 1}` : null,
      per_page: perPage,
      to: total > 0 ? Math.min(offset + perPage, total) : null,
      total
    };
  }
  async deletePaymentLog(id) {
    await this.db.prepare("DELETE FROM payment_logs WHERE id = ?").bind(id).run();
  }
  async bulkDeletePaymentLogs({ type, ids = [] }) {
    if (type === "all") {
      const res = await this.db.prepare("DELETE FROM payment_logs").run();
      return res.meta.changes || 0;
    } else {
      if (!ids || ids.length === 0)
        return 0;
      const placeholders = ids.map(() => "?").join(",");
      const res = await this.db.prepare(`DELETE FROM payment_logs WHERE id IN (${placeholders})`).bind(...ids).run();
      return res.meta.changes || 0;
    }
  }
  async getAllPaymentLogsFiltered({ search = "", gateway = "", status = "" }) {
    let whereClauses = [];
    let params = [];
    if (search) {
      whereClauses.push("(external_reference LIKE ? OR phone LIKE ? OR gateway_reference LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (gateway && gateway !== "all") {
      whereClauses.push("gateway = ?");
      params.push(gateway.toLowerCase());
    }
    if (status && status !== "all") {
      whereClauses.push("status = ?");
      params.push(status.toLowerCase());
    }
    const whereSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
    const res = await this.db.prepare(`SELECT * FROM payment_logs ${whereSql} ORDER BY created_at DESC`).bind(...params).all();
    return (res.results || []).map((row) => this.parseLogItem(row));
  }
  parseLogItem(row) {
    if (!row)
      return null;
    return {
      ...row,
      raw_request: row.raw_request ? JSON.parse(row.raw_request) : null,
      raw_response: row.raw_response ? JSON.parse(row.raw_response) : null,
      callback_payload: row.callback_payload ? JSON.parse(row.callback_payload) : null
    };
  }
  // --- EMULATOR HELPER METHODS ---
  async createEmulatorTxn(txnData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const res = await this.db.prepare(
      `INSERT INTO emulator_transactions (gateway, external_id, amount, phone, buyer_name, buyer_email, status, raw_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      txnData.gateway,
      txnData.external_id,
      txnData.amount,
      txnData.phone,
      txnData.buyer_name || null,
      txnData.buyer_email || null,
      txnData.status || "pending",
      txnData.raw_payload ? JSON.stringify(txnData.raw_payload) : null,
      now,
      now
    ).run();
    return res.meta.last_row_id;
  }
  async getEmulatorTxns(limit = 50) {
    const res = await this.db.prepare("SELECT * FROM emulator_transactions ORDER BY created_at DESC LIMIT ?").bind(limit).all();
    return (res.results || []).map((row) => ({
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null
    }));
  }
  async findEmulatorTxnById(id) {
    const row = await this.db.prepare("SELECT * FROM emulator_transactions WHERE id = ?").bind(id).first();
    if (!row)
      return null;
    return {
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null
    };
  }
  async findEmulatorTxnByExtId(externalId, gateway = "selcom") {
    const row = await this.db.prepare("SELECT * FROM emulator_transactions WHERE external_id = ? AND gateway = ? ORDER BY id DESC LIMIT 1").bind(externalId, gateway).first();
    if (!row)
      return null;
    return {
      ...row,
      raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null
    };
  }
  async updateEmulatorTxn(id, updateData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await this.db.prepare("UPDATE emulator_transactions SET status = ?, updated_at = ? WHERE id = ?").bind(updateData.status, now, id).run();
  }
};
__name(DbClient, "DbClient");

// node_modules/unenv/dist/runtime/node/internal/crypto/node.mjs
var webcrypto = new Proxy(globalThis.crypto, { get(_, key) {
  if (key === "CryptoKey") {
    return globalThis.CryptoKey;
  }
  if (typeof globalThis.crypto[key] === "function") {
    return globalThis.crypto[key].bind(globalThis.crypto);
  }
  return globalThis.crypto[key];
} });
var createCipher = /* @__PURE__ */ notImplemented("crypto.createCipher");
var createDecipher = /* @__PURE__ */ notImplemented("crypto.createDecipher");
var pseudoRandomBytes = /* @__PURE__ */ notImplemented("crypto.pseudoRandomBytes");
var createCipheriv = /* @__PURE__ */ notImplemented("crypto.createCipheriv");
var createDecipheriv = /* @__PURE__ */ notImplemented("crypto.createDecipheriv");
var createECDH = /* @__PURE__ */ notImplemented("crypto.createECDH");
var createSign = /* @__PURE__ */ notImplemented("crypto.createSign");
var createVerify = /* @__PURE__ */ notImplemented("crypto.createVerify");
var diffieHellman = /* @__PURE__ */ notImplemented("crypto.diffieHellman");
var getCipherInfo = /* @__PURE__ */ notImplemented("crypto.getCipherInfo");
var privateDecrypt = /* @__PURE__ */ notImplemented("crypto.privateDecrypt");
var privateEncrypt = /* @__PURE__ */ notImplemented("crypto.privateEncrypt");
var publicDecrypt = /* @__PURE__ */ notImplemented("crypto.publicDecrypt");
var publicEncrypt = /* @__PURE__ */ notImplemented("crypto.publicEncrypt");
var sign = /* @__PURE__ */ notImplemented("crypto.sign");
var verify = /* @__PURE__ */ notImplemented("crypto.verify");
var hash = /* @__PURE__ */ notImplemented("crypto.hash");
var Cipher = /* @__PURE__ */ notImplementedClass("crypto.Cipher");
var Cipheriv = /* @__PURE__ */ notImplementedClass(
  "crypto.Cipheriv"
  // @ts-expect-error not typed yet
);
var Decipher = /* @__PURE__ */ notImplementedClass("crypto.Decipher");
var Decipheriv = /* @__PURE__ */ notImplementedClass(
  "crypto.Decipheriv"
  // @ts-expect-error not typed yet
);
var ECDH = /* @__PURE__ */ notImplementedClass("crypto.ECDH");
var Sign = /* @__PURE__ */ notImplementedClass("crypto.Sign");
var Verify = /* @__PURE__ */ notImplementedClass("crypto.Verify");

// node_modules/unenv/dist/runtime/node/internal/crypto/constants.mjs
var SSL_OP_ALL = 2147485776;
var SSL_OP_ALLOW_NO_DHE_KEX = 1024;
var SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION = 262144;
var SSL_OP_CIPHER_SERVER_PREFERENCE = 4194304;
var SSL_OP_CISCO_ANYCONNECT = 32768;
var SSL_OP_COOKIE_EXCHANGE = 8192;
var SSL_OP_CRYPTOPRO_TLSEXT_BUG = 2147483648;
var SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS = 2048;
var SSL_OP_LEGACY_SERVER_CONNECT = 4;
var SSL_OP_NO_COMPRESSION = 131072;
var SSL_OP_NO_ENCRYPT_THEN_MAC = 524288;
var SSL_OP_NO_QUERY_MTU = 4096;
var SSL_OP_NO_RENEGOTIATION = 1073741824;
var SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION = 65536;
var SSL_OP_NO_SSLv2 = 0;
var SSL_OP_NO_SSLv3 = 33554432;
var SSL_OP_NO_TICKET = 16384;
var SSL_OP_NO_TLSv1 = 67108864;
var SSL_OP_NO_TLSv1_1 = 268435456;
var SSL_OP_NO_TLSv1_2 = 134217728;
var SSL_OP_NO_TLSv1_3 = 536870912;
var SSL_OP_PRIORITIZE_CHACHA = 2097152;
var SSL_OP_TLS_ROLLBACK_BUG = 8388608;
var ENGINE_METHOD_RSA = 1;
var ENGINE_METHOD_DSA = 2;
var ENGINE_METHOD_DH = 4;
var ENGINE_METHOD_RAND = 8;
var ENGINE_METHOD_EC = 2048;
var ENGINE_METHOD_CIPHERS = 64;
var ENGINE_METHOD_DIGESTS = 128;
var ENGINE_METHOD_PKEY_METHS = 512;
var ENGINE_METHOD_PKEY_ASN1_METHS = 1024;
var ENGINE_METHOD_ALL = 65535;
var ENGINE_METHOD_NONE = 0;
var DH_CHECK_P_NOT_SAFE_PRIME = 2;
var DH_CHECK_P_NOT_PRIME = 1;
var DH_UNABLE_TO_CHECK_GENERATOR = 4;
var DH_NOT_SUITABLE_GENERATOR = 8;
var RSA_PKCS1_PADDING = 1;
var RSA_NO_PADDING = 3;
var RSA_PKCS1_OAEP_PADDING = 4;
var RSA_X931_PADDING = 5;
var RSA_PKCS1_PSS_PADDING = 6;
var RSA_PSS_SALTLEN_DIGEST = -1;
var RSA_PSS_SALTLEN_MAX_SIGN = -2;
var RSA_PSS_SALTLEN_AUTO = -2;
var POINT_CONVERSION_COMPRESSED = 2;
var POINT_CONVERSION_UNCOMPRESSED = 4;
var POINT_CONVERSION_HYBRID = 6;
var defaultCoreCipherList = "";
var defaultCipherList = "";
var OPENSSL_VERSION_NUMBER = 0;
var TLS1_VERSION = 0;
var TLS1_1_VERSION = 0;
var TLS1_2_VERSION = 0;
var TLS1_3_VERSION = 0;

// node_modules/unenv/dist/runtime/node/crypto.mjs
var constants = {
  OPENSSL_VERSION_NUMBER,
  SSL_OP_ALL,
  SSL_OP_ALLOW_NO_DHE_KEX,
  SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
  SSL_OP_CIPHER_SERVER_PREFERENCE,
  SSL_OP_CISCO_ANYCONNECT,
  SSL_OP_COOKIE_EXCHANGE,
  SSL_OP_CRYPTOPRO_TLSEXT_BUG,
  SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS,
  SSL_OP_LEGACY_SERVER_CONNECT,
  SSL_OP_NO_COMPRESSION,
  SSL_OP_NO_ENCRYPT_THEN_MAC,
  SSL_OP_NO_QUERY_MTU,
  SSL_OP_NO_RENEGOTIATION,
  SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,
  SSL_OP_NO_SSLv2,
  SSL_OP_NO_SSLv3,
  SSL_OP_NO_TICKET,
  SSL_OP_NO_TLSv1,
  SSL_OP_NO_TLSv1_1,
  SSL_OP_NO_TLSv1_2,
  SSL_OP_NO_TLSv1_3,
  SSL_OP_PRIORITIZE_CHACHA,
  SSL_OP_TLS_ROLLBACK_BUG,
  ENGINE_METHOD_RSA,
  ENGINE_METHOD_DSA,
  ENGINE_METHOD_DH,
  ENGINE_METHOD_RAND,
  ENGINE_METHOD_EC,
  ENGINE_METHOD_CIPHERS,
  ENGINE_METHOD_DIGESTS,
  ENGINE_METHOD_PKEY_METHS,
  ENGINE_METHOD_PKEY_ASN1_METHS,
  ENGINE_METHOD_ALL,
  ENGINE_METHOD_NONE,
  DH_CHECK_P_NOT_SAFE_PRIME,
  DH_CHECK_P_NOT_PRIME,
  DH_UNABLE_TO_CHECK_GENERATOR,
  DH_NOT_SUITABLE_GENERATOR,
  RSA_PKCS1_PADDING,
  RSA_NO_PADDING,
  RSA_PKCS1_OAEP_PADDING,
  RSA_X931_PADDING,
  RSA_PKCS1_PSS_PADDING,
  RSA_PSS_SALTLEN_DIGEST,
  RSA_PSS_SALTLEN_MAX_SIGN,
  RSA_PSS_SALTLEN_AUTO,
  defaultCoreCipherList,
  TLS1_VERSION,
  TLS1_1_VERSION,
  TLS1_2_VERSION,
  TLS1_3_VERSION,
  POINT_CONVERSION_COMPRESSED,
  POINT_CONVERSION_UNCOMPRESSED,
  POINT_CONVERSION_HYBRID,
  defaultCipherList
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs
var workerdCrypto = process.getBuiltinModule("node:crypto");
var {
  Certificate,
  DiffieHellman,
  DiffieHellmanGroup,
  Hash,
  Hmac,
  KeyObject,
  X509Certificate,
  checkPrime,
  checkPrimeSync,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSecretKey,
  generateKey,
  generateKeyPair,
  generateKeyPairSync,
  generateKeySync,
  generatePrime,
  generatePrimeSync,
  getCiphers,
  getCurves,
  getDiffieHellman,
  getFips,
  getHashes,
  hkdf,
  hkdfSync,
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  randomUUID,
  scrypt,
  scryptSync,
  secureHeapUsed,
  setEngine,
  setFips,
  subtle,
  timingSafeEqual
} = workerdCrypto;
var getRandomValues = workerdCrypto.getRandomValues.bind(
  workerdCrypto.webcrypto
);
var webcrypto2 = {
  // @ts-expect-error unenv has unknown type
  CryptoKey: webcrypto.CryptoKey,
  getRandomValues,
  randomUUID,
  subtle
};
var fips = workerdCrypto.fips;
var crypto_default = {
  /**
   * manually unroll unenv-polyfilled-symbols to make it tree-shakeable
   */
  Certificate,
  Cipher,
  Cipheriv,
  Decipher,
  Decipheriv,
  ECDH,
  Sign,
  Verify,
  X509Certificate,
  // @ts-expect-error @types/node is out of date - this is a bug in typings
  constants,
  // @ts-expect-error unenv has unknown type
  createCipheriv,
  // @ts-expect-error unenv has unknown type
  createDecipheriv,
  // @ts-expect-error unenv has unknown type
  createECDH,
  // @ts-expect-error unenv has unknown type
  createSign,
  // @ts-expect-error unenv has unknown type
  createVerify,
  // @ts-expect-error unenv has unknown type
  diffieHellman,
  // @ts-expect-error unenv has unknown type
  getCipherInfo,
  // @ts-expect-error unenv has unknown type
  hash,
  // @ts-expect-error unenv has unknown type
  privateDecrypt,
  // @ts-expect-error unenv has unknown type
  privateEncrypt,
  // @ts-expect-error unenv has unknown type
  publicDecrypt,
  // @ts-expect-error unenv has unknown type
  publicEncrypt,
  scrypt,
  scryptSync,
  // @ts-expect-error unenv has unknown type
  sign,
  // @ts-expect-error unenv has unknown type
  verify,
  // default-only export from unenv
  // @ts-expect-error unenv has unknown type
  createCipher,
  // @ts-expect-error unenv has unknown type
  createDecipher,
  // @ts-expect-error unenv has unknown type
  pseudoRandomBytes,
  /**
   * manually unroll workerd-polyfilled-symbols to make it tree-shakeable
   */
  DiffieHellman,
  DiffieHellmanGroup,
  Hash,
  Hmac,
  KeyObject,
  checkPrime,
  checkPrimeSync,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSecretKey,
  generateKey,
  generateKeyPair,
  generateKeyPairSync,
  generateKeySync,
  generatePrime,
  generatePrimeSync,
  getCiphers,
  getCurves,
  getDiffieHellman,
  getFips,
  getHashes,
  getRandomValues,
  hkdf,
  hkdfSync,
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  randomUUID,
  secureHeapUsed,
  setEngine,
  setFips,
  subtle,
  timingSafeEqual,
  // default-only export from workerd
  fips,
  // special-cased deep merged symbols
  webcrypto: webcrypto2
};

// src/gateways/SelcomGateway.js
var SelcomGateway = class {
  getName() {
    return "selcom";
  }
  async initiatePayment(dbClient, params, originUrl = "") {
    const baseUrl = (await dbClient.getConfig("selcom_base_url")).replace(/\/+$/, "");
    const apiKey = await dbClient.getConfig("selcom_api_key");
    const apiSecret = await dbClient.getConfig("selcom_secret_key");
    const vendor = await dbClient.getConfig("selcom_vendor");
    const webappCallbackUrl = await dbClient.getConfig("webapp_callback_url");
    const orderId = params.external_reference || `SEL-${Date.now()}`;
    const phone = this.formatPhoneNumber(params.phone || "");
    const redirect = btoa(`${webappCallbackUrl}?status=success&ref=${orderId}`);
    const cancel = btoa(`${webappCallbackUrl}?status=cancelled&ref=${orderId}`);
    const webhookUrl = `${originUrl}/api/v1/callbacks/selcom`;
    const orderMinArray = {
      vendor,
      order_id: orderId,
      buyer_email: params.email || "customer@example.com",
      buyer_name: params.name || "Guest Customer",
      buyer_phone: phone,
      amount: parseInt(params.amount, 10),
      currency: "TZS",
      redirect_url: redirect,
      cancel_url: cancel,
      webhook: webhookUrl,
      buyer_remarks: params.remarks || "Payment",
      merchant_remarks: `Order ${orderId}`,
      no_of_items: 1
    };
    const headers = this.computeHeaders(orderMinArray, apiKey, apiSecret);
    try {
      const response = await fetch(`${baseUrl}/checkout/create-order-minimal`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderMinArray)
      });
      const responseBody = await response.json().catch(() => null);
      if (response.ok && responseBody && String(responseBody.result || "").toLowerCase() === "success") {
        const data = responseBody.data?.[0] || {};
        let paymentUrl = null;
        if (data.payment_gateway_url) {
          try {
            paymentUrl = atob(data.payment_gateway_url);
          } catch (e) {
            paymentUrl = data.payment_gateway_url;
          }
        }
        return {
          success: true,
          gateway_reference: data.reference || null,
          payment_url: paymentUrl,
          raw_response: responseBody
        };
      }
      return {
        success: false,
        error: responseBody?.message || "Gateway failed to initiate payment",
        raw_response: responseBody || await response.text().catch(() => "")
      };
    } catch (e) {
      console.error("Selcom initiatePayment error:", e);
      return {
        success: false,
        error: `Connection to Selcom failed: ${e.message}`,
        raw_response: { exception: e.message }
      };
    }
  }
  async verifyWebhookSignature(dbClient, headers, requestData) {
    const digestHeader = headers.get("digest");
    const timestamp = headers.get("timestamp");
    const signedFields = headers.get("signed-fields");
    if (!digestHeader || !timestamp || !signedFields) {
      return false;
    }
    const apiSecret = await dbClient.getConfig("selcom_secret_key");
    if (!apiSecret)
      return false;
    const fields = signedFields.split(",");
    let data = `timestamp=${timestamp}`;
    for (const field of fields) {
      if (requestData[field] === void 0) {
        return false;
      }
      data += `&${field}=${String(requestData[field])}`;
    }
    const computed = crypto_default.createHmac("sha256", apiSecret).update(data).digest("base64");
    return digestHeader === computed;
  }
  parseCallback(data) {
    const orderId = data.order_id || data.utilityref || null;
    const reference = data.reference || data.transid || null;
    const amount = data.amount ? parseFloat(data.amount) : 0;
    const result = String(data.result || "").toLowerCase();
    const resultCode = String(data.resultcode || "");
    let status = "failed";
    if (result === "success" || resultCode === "000") {
      status = "success";
    }
    return {
      external_reference: orderId,
      gateway: "selcom",
      gateway_reference: reference,
      amount,
      status,
      phone: data.msisdn || "",
      message: data.message || (status === "success" ? "Payment succeeded" : "Payment failed"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  computeHeaders(arrayData, apiKey, apiSecret) {
    const authToken = "SELCOM " + btoa(apiKey || "");
    const signedFields = Object.keys(arrayData).join(",");
    const fieldOrder = signedFields.split(",");
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    let data = `timestamp=${timestamp}`;
    for (const key of fieldOrder) {
      data += `&${key}=${String(arrayData[key])}`;
    }
    const digest = crypto_default.createHmac("sha256", apiSecret || "").update(data).digest("base64");
    return {
      Authorization: authToken,
      "Digest-Method": "HS256",
      Timestamp: timestamp,
      Digest: digest,
      "Signed-Fields": signedFields,
      Accept: "application/json",
      "Content-Type": "application/json"
    };
  }
  formatPhoneNumber(phone) {
    let p = String(phone || "").replace(/[^0-9]/g, "").trim();
    if (p.startsWith("0")) {
      p = "255" + p.substring(1);
    }
    if (p.startsWith("2550")) {
      p = "255" + p.substring(4);
    }
    if (p.length === 9) {
      p = "255" + p;
    }
    return p;
  }
};
__name(SelcomGateway, "SelcomGateway");

// src/gateways/AzamPayGateway.js
var AzamPayGateway = class {
  getName() {
    return "azampay";
  }
  async initiatePayment(dbClient, params) {
    const baseUrl = (await dbClient.getConfig("azampay_base_url")).replace(/\/+$/, "");
    const authBaseUrl = (await dbClient.getConfig("azampay_auth_base_url")).replace(/\/+$/, "");
    const clientId = await dbClient.getConfig("azampay_client_id");
    const clientSecret = await dbClient.getConfig("azampay_client_secret");
    const appName = await dbClient.getConfig("azampay_app_name");
    const apiKey = await dbClient.getConfig("azampay_api_key");
    const phone = this.formatPhoneNumber(params.phone || "");
    const provider = params.provider || this.detectOperator(phone);
    if (!provider) {
      return {
        success: false,
        error: "Unable to detect mobile operator from phone number prefix",
        raw_response: { phone }
      };
    }
    let token = null;
    let tokenData = null;
    try {
      const tokenRes = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          appName,
          clientId,
          clientSecret
        })
      });
      tokenData = await tokenRes.json().catch(() => null);
      if (tokenData) {
        token = tokenData.token || tokenData.data?.accessToken || tokenData.data?.token || tokenData.accessToken;
      }
      if (!tokenRes.ok || !token) {
        return {
          success: false,
          error: `Failed to generate AzamPay token: ${tokenData?.message || "Unknown error"}`,
          raw_response: tokenData
        };
      }
    } catch (e) {
      console.error("AzamPay token generation error:", e);
      return {
        success: false,
        error: `AzamPay token generation failed: ${e.message}`,
        raw_response: { exception: e.message }
      };
    }
    const externalId = params.external_reference || `GTY-1-${Date.now()}`;
    const payload = {
      amount: String(params.amount),
      currency: "TZS",
      accountNumber: phone,
      externalId,
      provider
    };
    try {
      const checkoutRes = await fetch(`${baseUrl}/azampay/mno/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-KEY": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseBody = await checkoutRes.json().catch(() => null);
      if (checkoutRes.ok && responseBody && (responseBody.success === true || responseBody.success === "true")) {
        return {
          success: true,
          gateway_reference: responseBody.transactionId || null,
          payment_url: null,
          raw_response: responseBody
        };
      }
      return {
        success: false,
        error: responseBody?.message || "Gateway failed to initiate payment",
        raw_response: responseBody || await checkoutRes.text().catch(() => "")
      };
    } catch (e) {
      console.error("AzamPay initiatePayment error:", e);
      return {
        success: false,
        error: `Connection to AzamPay failed: ${e.message}`,
        raw_response: { exception: e.message }
      };
    }
  }
  async verifyWebhookSignature(dbClient, headers, rawBody) {
    const signature = headers.get("x-signature") || headers.get("signature");
    if (!signature) {
      return true;
    }
    const secret = await dbClient.getConfig("azampay_client_secret");
    if (!secret)
      return true;
    const computed = crypto_default.createHmac("sha256", secret).update(rawBody || "").digest("hex");
    return signature.toLowerCase() === computed.toLowerCase();
  }
  parseCallback(data) {
    const orderId = data.utilityref || data.externalId || null;
    const reference = data.transactionId || null;
    const amount = data.amount ? parseFloat(data.amount) : 0;
    const statusVal = String(data.status || "").toLowerCase();
    let status = "failed";
    if (statusVal === "success" || statusVal === "completed" || statusVal === "paid") {
      status = "success";
    }
    return {
      external_reference: orderId,
      gateway: "azampay",
      gateway_reference: reference,
      amount,
      status,
      phone: data.msisdn || "",
      message: data.message || (status === "success" ? "Payment succeeded" : "Payment failed"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  detectOperator(phone) {
    const cleaned = this.formatPhoneNumber(phone);
    if (/^255(75|76|74|61|79)/.test(cleaned))
      return "Mpesa";
    if (/^255(65|67|71)/.test(cleaned))
      return "Tigo";
    if (/^255(68|69|78)/.test(cleaned))
      return "Airtel";
    if (/^255(62)/.test(cleaned))
      return "Halopesa";
    if (/^255(73)/.test(cleaned))
      return "Azampesa";
    return null;
  }
  formatPhoneNumber(phone) {
    let p = String(phone || "").replace(/[^0-9]/g, "").trim();
    if (p.startsWith("0")) {
      p = "255" + p.substring(1);
    }
    if (p.startsWith("2550")) {
      p = "255" + p.substring(4);
    }
    if (p.length === 9) {
      p = "255" + p;
    }
    return p;
  }
};
__name(AzamPayGateway, "AzamPayGateway");

// src/gateways/PaymentProcessorManager.js
var PaymentProcessorManager = class {
  constructor() {
    this.drivers = {
      selcom: new SelcomGateway(),
      azampay: new AzamPayGateway()
    };
  }
  async getGateway(dbClient, driverName = null) {
    const activeDriver = driverName || await dbClient.getConfig("active_gateway", "selcom");
    const normalized = String(activeDriver).toLowerCase();
    if (!this.drivers[normalized]) {
      throw new Error(`Unsupported payment gateway driver: ${driverName}`);
    }
    return this.drivers[normalized];
  }
  getAvailableDrivers() {
    return Object.keys(this.drivers);
  }
};
__name(PaymentProcessorManager, "PaymentProcessorManager");

// src/routes/api.js
var apiRoutes = new Hono2();
var manager = new PaymentProcessorManager();
apiRoutes.post("/v1/payments/initiate", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ success: false, message: "Invalid JSON request body" }, 400);
  }
  const { amount, phone, external_reference, email, name, gateway: reqGateway, remarks } = body;
  if (!amount || isNaN(amount) || Number(amount) < 1) {
    return c.json({ success: false, message: "The amount field is required and must be at least 1." }, 400);
  }
  if (!phone) {
    return c.json({ success: false, message: "The phone field is required." }, 400);
  }
  if (!external_reference) {
    return c.json({ success: false, message: "The external_reference field is required." }, 400);
  }
  const gatewayName = reqGateway || await dbClient.getConfig("active_gateway", "selcom");
  let gateway;
  try {
    gateway = await manager.getGateway(dbClient, gatewayName);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 400);
  }
  const logId = await dbClient.createPaymentLog({
    external_reference,
    gateway: gateway.getName(),
    amount: parseFloat(amount),
    phone: String(phone),
    status: "pending",
    raw_request: body
  });
  const originUrl = new URL(c.req.url).origin;
  const result = await gateway.initiatePayment(
    dbClient,
    {
      amount,
      phone,
      email,
      name,
      external_reference,
      remarks
    },
    originUrl
  );
  await dbClient.updatePaymentLog(logId, {
    gateway_reference: result.gateway_reference || null,
    status: result.success ? "pending" : "failed",
    raw_response: result.raw_response || null
  });
  if (result.success) {
    return c.json({
      success: true,
      external_reference,
      gateway_reference: result.gateway_reference,
      payment_url: result.payment_url,
      message: "Payment initiated successfully."
    });
  }
  return c.json(
    {
      success: false,
      external_reference,
      message: result.error || "Gateway initiation failed."
    },
    502
  );
});
apiRoutes.get("/v1/payments/status/:external_reference", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const externalRef = c.req.param("external_reference");
  const log3 = await dbClient.findPaymentLogByRef(externalRef);
  if (!log3) {
    return c.json({ success: false, message: "Payment log not found" }, 404);
  }
  return c.json({
    success: true,
    external_reference: log3.external_reference,
    status: log3.status,
    amount: log3.amount,
    gateway: log3.gateway,
    gateway_reference: log3.gateway_reference,
    message: log3.status === "success" ? "Payment completed successfully" : log3.status === "failed" ? "Payment failed" : "Payment is pending",
    created_at: log3.created_at,
    updated_at: log3.updated_at
  });
});
apiRoutes.post("/v1/callbacks/:gateway", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const gatewayName = c.req.param("gateway");
  let bodyData = {};
  const rawBody = await c.req.text().catch(() => "");
  try {
    bodyData = JSON.parse(rawBody);
  } catch (e) {
  }
  console.log(`Incoming callback from: ${gatewayName}`, {
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    body: bodyData
  });
  let gateway;
  try {
    gateway = await manager.getGateway(dbClient, gatewayName);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
  const isValidSig = await gateway.verifyWebhookSignature(dbClient, c.req.raw.headers, rawBody || bodyData);
  if (!isValidSig) {
    console.warn(`Callback signature verification failed for gateway: ${gatewayName}`);
    return c.json({ error: "Invalid signature" }, 403);
  }
  const parsed = gateway.parseCallback(bodyData);
  const log3 = await dbClient.findPaymentLogByRef(parsed.external_reference, gatewayName);
  if (log3) {
    await dbClient.updatePaymentLog(log3.id, {
      gateway_reference: parsed.gateway_reference || log3.gateway_reference,
      status: parsed.status,
      callback_payload: bodyData
    });
  } else {
    console.warn(`Transaction log not found for reference: ${parsed.external_reference || "n/a"}`);
  }
  const webappCallbackUrl = await dbClient.getConfig("webapp_callback_url");
  if (webappCallbackUrl) {
    try {
      const fwdRes = await fetch(webappCallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      if (!fwdRes.ok) {
        console.error(`Failed to forward callback to WebApp. Status: ${fwdRes.status}`);
      } else {
        console.log(`Successfully forwarded callback to WebApp. Ref: ${parsed.external_reference}`);
      }
    } catch (e) {
      console.error("Exception occurred while forwarding callback to WebApp:", e.message);
    }
  } else {
    console.warn("WebApp callback URL is not configured. Skipped forwarding.");
  }
  return c.json({
    success: true,
    status: "acknowledged"
  });
});
apiRoutes.get("/v1/config", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  return c.json({
    active_gateway: await dbClient.getConfig("active_gateway", "selcom"),
    webapp_callback_url: await dbClient.getConfig("webapp_callback_url"),
    available_gateways: manager.getAvailableDrivers()
  });
});
apiRoutes.post("/v1/config", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  if (body.active_gateway) {
    if (!["selcom", "azampay"].includes(body.active_gateway)) {
      return c.json({ success: false, message: "Invalid active_gateway value" }, 400);
    }
    await dbClient.setConfig("active_gateway", body.active_gateway);
  }
  if (body.webapp_callback_url !== void 0) {
    await dbClient.setConfig("webapp_callback_url", body.webapp_callback_url);
  }
  return c.json({
    success: true,
    message: "Configuration updated successfully.",
    active_gateway: await dbClient.getConfig("active_gateway", "selcom"),
    webapp_callback_url: await dbClient.getConfig("webapp_callback_url")
  });
});
apiRoutes.get("/v1/logs", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query("search") || "";
  const gateway = c.req.query("gateway") || "";
  const status = c.req.query("status") || "";
  const page = parseInt(c.req.query("page") || "1", 10);
  const perPage = parseInt(c.req.query("per_page") || "10", 10);
  const logs = await dbClient.getPaymentLogs({ search, gateway, status, page, perPage });
  return c.json(logs);
});

// src/routes/emulatorApi.js
var emulatorApiRoutes = new Hono2();
function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}
__name(generateRandomString, "generateRandomString");
emulatorApiRoutes.post("/azampay/AppRegistration/GenerateToken", async (c) => {
  const token = "emulator_" + generateRandomString(48);
  return c.json({
    success: true,
    statusCode: 200,
    message: "Token generated successfully.",
    data: {
      accessToken: token,
      expire: new Date(Date.now() + 36e5).toISOString()
    },
    token
  });
});
emulatorApiRoutes.post("/azampay/azampay/mno/checkout", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body = {};
  try {
    body = await c.req.json();
  } catch (e) {
  }
  const externalId = body.externalId || "AZAM-" + generateRandomString(8).toUpperCase();
  const amount = body.amount || 0;
  const phone = body.accountNumber || "";
  const provider = body.provider || "Unknown";
  await dbClient.createEmulatorTxn({
    gateway: "azampay",
    external_id: externalId,
    amount: parseFloat(amount),
    phone: String(phone),
    buyer_name: `Provider: ${provider}`,
    status: "pending",
    raw_payload: body
  });
  console.log(`[EMULATOR] AzamPay checkout created. Ref: ${externalId}`);
  return c.json({
    success: true,
    transactionId: "EMTXN-" + generateRandomString(12).toUpperCase(),
    message: "Payment request received. Awaiting customer action."
  });
});
emulatorApiRoutes.post("/selcom/checkout/create-order-minimal", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body = {};
  try {
    body = await c.req.json();
  } catch (e) {
  }
  const orderId = body.order_id || "SEL-" + generateRandomString(8).toUpperCase();
  const amount = body.amount || 0;
  const phone = body.buyer_phone || "";
  const buyerName = body.buyer_name || "Customer";
  const buyerEmail = body.buyer_email || "";
  const originUrl = new URL(c.req.url).origin;
  const paymentUrl = `${originUrl}/emulator/selcom-pay/${orderId}`;
  const encodedUrl = btoa(paymentUrl);
  await dbClient.createEmulatorTxn({
    gateway: "selcom",
    external_id: orderId,
    amount: parseFloat(amount),
    phone: String(phone),
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    status: "pending",
    raw_payload: body
  });
  console.log(`[EMULATOR] Selcom order created. Ref: ${orderId}`);
  return c.json({
    result: "SUCCESS",
    message: "Order created successfully.",
    data: [
      {
        reference: "EMSEL-" + generateRandomString(10).toUpperCase(),
        payment_gateway_url: encodedUrl
      }
    ]
  });
});
emulatorApiRoutes.get("/transactions", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const txns = await dbClient.getEmulatorTxns(50);
  return c.json(txns);
});
emulatorApiRoutes.post("/resolve/:id", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json().catch(() => ({}));
  const action = body.action;
  if (!["approve", "reject", "timeout"].includes(action)) {
    return c.json({ error: "Action must be approve, reject, or timeout" }, 400);
  }
  const transaction = await dbClient.findEmulatorTxnById(id);
  if (!transaction) {
    return c.json({ error: "Transaction not found" }, 404);
  }
  if (transaction.status !== "pending") {
    return c.json({ error: "Transaction already resolved." }, 422);
  }
  const statusMap = {
    approve: "approved",
    reject: "rejected",
    timeout: "timeout"
  };
  const resolvedStatus = statusMap[action];
  await dbClient.updateEmulatorTxn(id, { status: resolvedStatus });
  const originUrl = new URL(c.req.url).origin;
  await fireCallback(dbClient, transaction, resolvedStatus, originUrl);
  const updatedTxn = await dbClient.findEmulatorTxnById(id);
  return c.json({
    success: true,
    transaction: updatedTxn
  });
});
async function fireCallback(dbClient, transaction, resolvedStatus, originUrl) {
  const gateway = transaction.gateway;
  const callbackUrl = `${originUrl}/api/v1/callbacks/${gateway}`;
  const paymentStatus = resolvedStatus === "approved" ? "success" : "failed";
  if (gateway === "azampay") {
    const payload = {
      utilityref: transaction.external_id,
      externalId: transaction.external_id,
      transactionId: "EMTXN-" + generateRandomString(12).toUpperCase(),
      amount: String(transaction.amount),
      msisdn: transaction.phone,
      status: paymentStatus,
      message: resolvedStatus === "approved" ? "Payment completed successfully" : "Payment was declined by customer"
    };
    const secret = await dbClient.getConfig("azampay_client_secret") || "emulator_secret";
    const rawBody = JSON.stringify(payload);
    const signature = crypto_default.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature
        },
        body: rawBody
      });
      console.log(`[EMULATOR] AzamPay callback fired. Ref: ${transaction.external_id}`);
    } catch (e) {
      console.error(`[EMULATOR] Failed to fire AzamPay callback:`, e.message);
    }
  }
  if (gateway === "selcom") {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const secret = await dbClient.getConfig("selcom_secret_key") || "emulator_secret";
    const resultCode = resolvedStatus === "approved" ? "000" : "999";
    const result = resolvedStatus === "approved" ? "success" : "failure";
    const reference = "EMSEL-" + generateRandomString(10).toUpperCase();
    const payload = {
      order_id: transaction.external_id,
      reference,
      amount: String(transaction.amount),
      msisdn: transaction.phone,
      result,
      resultcode: resultCode,
      message: resolvedStatus === "approved" ? "Payment successful" : "Payment declined"
    };
    const signedFields = Object.keys(payload).join(",");
    let data = `timestamp=${timestamp}`;
    for (const k of Object.keys(payload)) {
      data += `&${k}=${String(payload[k])}`;
    }
    const digest = crypto_default.createHmac("sha256", secret).update(data).digest("base64");
    try {
      await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Timestamp: timestamp,
          Digest: digest,
          "Digest-Method": "HS256",
          "Signed-Fields": signedFields
        },
        body: JSON.stringify(payload)
      });
      console.log(`[EMULATOR] Selcom callback fired. Ref: ${transaction.external_id}`);
    } catch (e) {
      console.error(`[EMULATOR] Failed to fire Selcom callback:`, e.message);
    }
  }
}
__name(fireCallback, "fireCallback");

// src/views/layout.js
function renderLayout({ title: title2, activeTab, content, flashMessage }) {
  const flashHtml = flashMessage ? `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div class="rounded-md ${flashMessage.type === "error" ? "bg-red-50 border-l-4 border-red-400 p-4 text-red-700" : "bg-green-50 border-l-4 border-green-400 p-4 text-green-700"}">
        <p class="font-medium">${flashMessage.text}</p>
      </div>
    </div>` : "";
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title2} - Payment Processor</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"><\/script>
</head>
<body class="h-full font-sans antialiased text-slate-800 flex flex-col min-h-screen">
  <!-- Navbar -->
  <nav class="bg-slate-900 border-b border-slate-800 text-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="bg-indigo-600 p-2 rounded-lg text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <span class="font-bold text-lg text-white">Payment Processor</span>
            <span class="ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">Cloudflare Edge</span>
          </div>
        </div>
        <div class="flex space-x-2">
          <a href="/" class="px-3 py-2 text-sm font-medium rounded-md transition ${activeTab === "config" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}">Config & Logs</a>
          <a href="/emulator" class="px-3 py-2 text-sm font-medium rounded-md transition flex items-center space-x-1 ${activeTab === "emulator" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>Emulator Sandbox</span>
          </a>
        </div>
      </div>
    </div>
  </nav>

  ${flashHtml}

  <!-- Main Content -->
  <main class="flex-1 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      ${content}
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-4 mt-auto">
    <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
      Payment Processor Middleware &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} \u2014 Powered by Cloudflare Workers &amp; Hono JS
    </div>
  </footer>
</body>
</html>`;
}
__name(renderLayout, "renderLayout");

// src/views/configView.js
function renderConfigView(configs, logsData, flashMessage = null, queryParams = {}) {
  const activeGateway = configs.active_gateway || "selcom";
  const webappCallbackUrl = configs.webapp_callback_url || "";
  const selcomBaseUrl = configs.selcom_base_url || "";
  const selcomApiKey = configs.selcom_api_key || "";
  const selcomSecretKey = configs.selcom_secret_key || "";
  const selcomVendor = configs.selcom_vendor || "";
  const azamBaseUrl = configs.azampay_base_url || "";
  const azamAuthBaseUrl = configs.azampay_auth_base_url || "";
  const azamClientId = configs.azampay_client_id || "";
  const azamClientSecret = configs.azampay_client_secret || "";
  const azamAppName = configs.azampay_app_name || "";
  const azamApiKey = configs.azampay_api_key || "";
  const searchVal = queryParams.search || "";
  const gatewayFilter = queryParams.gateway || "all";
  const statusFilter = queryParams.status || "all";
  const logs = logsData.data || [];
  const currentPage = logsData.current_page || 1;
  const lastPage = logsData.last_page || 1;
  const totalLogs = logsData.total || 0;
  const content = `
  <div x-data="{ activeTab: 'settings', selectedLogs: [], showModal: false, modalLog: null }">
    <!-- Header Tabs -->
    <div class="border-b border-slate-200 mb-6 flex justify-between items-end">
      <nav class="-mb-px flex space-x-8">
        <button @click="activeTab = 'settings'" :class="activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Gateway Configurations</span>
        </button>
        <button @click="activeTab = 'logs'" :class="activeTab === 'logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span>Transaction Logs (${totalLogs})</span>
        </button>
      </nav>
    </div>

    <!-- TAB 1: CONFIGURATIONS SETTINGS -->
    <div x-show="activeTab === 'settings'" class="space-y-6">
      <form action="/config/save" method="POST">
        
        <!-- General Processor Config -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4 border-b pb-2 flex items-center space-x-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            <span>General Middleware Settings</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Active Gateway Driver</label>
              <select name="active_gateway" class="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="selcom" ${activeGateway === "selcom" ? "selected" : ""}>Selcom Payment Gateway</option>
                <option value="azampay" ${activeGateway === "azampay" ? "selected" : ""}>AzamPay Mobile Money</option>
              </select>
              <p class="text-xs text-slate-500 mt-1">Default gateway used when request doesn't specify one.</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">WebApp Callback Forwarding URL</label>
              <input type="text" name="webapp_callback_url" value="${webappCallbackUrl}" placeholder="https://your-app.com/api/payments/callback" class="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <p class="text-xs text-slate-500 mt-1">Normalized payment status webhooks will be posted here.</p>
            </div>
          </div>
        </div>

        <!-- Selcom Config -->
        <div class="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Selcom Gateway Credentials</span>
            </h2>
            <button type="submit" name="test_gateway" value="selcom" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200 transition">
              \u26A1 Test Selcom Connection
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Selcom Base URL</label>
              <input type="text" name="selcom_base_url" value="${selcomBaseUrl}" placeholder="https://apigw.selcom.tz/v1" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Selcom Vendor ID (Till)</label>
              <input type="text" name="selcom_vendor" value="${selcomVendor}" placeholder="VEND1234" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Selcom API Key</label>
              <input type="text" name="selcom_api_key" value="${selcomApiKey}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Selcom Secret Key</label>
              <input type="password" name="selcom_secret_key" value="${selcomSecretKey}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
          </div>
        </div>

        <!-- AzamPay Config -->
        <div class="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-emerald-500">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>AzamPay Gateway Credentials</span>
            </h2>
            <button type="submit" name="test_gateway" value="azampay" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-200 transition">
              \u26A1 Test AzamPay Connection
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">AzamPay API Base URL</label>
              <input type="text" name="azampay_base_url" value="${azamBaseUrl}" placeholder="https://checkout.azampay.co.tz" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">AzamPay Auth Base URL</label>
              <input type="text" name="azampay_auth_base_url" value="${azamAuthBaseUrl}" placeholder="https://authenticator.azampay.co.tz" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Client ID</label>
              <input type="text" name="azampay_client_id" value="${azamClientId}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Client Secret</label>
              <input type="password" name="azampay_client_secret" value="${azamClientSecret}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">App Name</label>
              <input type="text" name="azampay_app_name" value="${azamAppName}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">X-API-KEY</label>
              <input type="password" name="azampay_api_key" value="${azamApiKey}" class="w-full rounded-md border-slate-300 border p-2 text-sm">
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow transition">
            Save Configurations
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 2: TRANSACTION LOGS MANAGEMENT -->
    <div x-show="activeTab === 'logs'" class="space-y-4">
      
      <!-- Filters and Actions Bar -->
      <div class="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4">
        <form action="/" method="GET" class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input type="hidden" name="tab" value="logs">
          <input type="text" name="search" value="${searchVal}" placeholder="Search ref, phone..." class="border rounded p-2 text-xs w-48">
          <select name="gateway" class="border rounded p-2 text-xs">
            <option value="all" ${gatewayFilter === "all" ? "selected" : ""}>All Gateways</option>
            <option value="selcom" ${gatewayFilter === "selcom" ? "selected" : ""}>Selcom</option>
            <option value="azampay" ${gatewayFilter === "azampay" ? "selected" : ""}>AzamPay</option>
          </select>
          <select name="status" class="border rounded p-2 text-xs">
            <option value="all" ${statusFilter === "all" ? "selected" : ""}>All Statuses</option>
            <option value="pending" ${statusFilter === "pending" ? "selected" : ""}>Pending</option>
            <option value="success" ${statusFilter === "success" ? "selected" : ""}>Success</option>
            <option value="failed" ${statusFilter === "failed" ? "selected" : ""}>Failed</option>
          </select>
          <button type="submit" class="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded">Filter</button>
        </form>

        <div class="flex items-center space-x-2">
          <a href="/logs/export?format=csv&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border text-xs font-semibold rounded">\u{1F4E5} Export CSV</a>
          <a href="/logs/export?format=json&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border text-xs font-semibold rounded">\u{1F4E5} Export JSON</a>
          <button @click="bulkDeleteSelected()" x-show="selectedLogs.length > 0" class="px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded">Delete Selected (<span x-text="selectedLogs.length"></span>)</button>
          <button @click="bulkRetryFailed()" class="px-3 py-2 bg-amber-600 text-white text-xs font-semibold rounded">Retry Failed</button>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="p-3 text-left"><input type="checkbox" @change="toggleAll($event)"></th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Date</th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Ext Reference</th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Gateway</th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Phone</th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Amount</th>
              <th class="p-3 text-left font-semibold text-slate-600 text-xs">Status</th>
              <th class="p-3 text-right font-semibold text-slate-600 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${logs.length === 0 ? `<tr><td colspan="8" class="text-center py-8 text-slate-400 text-sm">No transaction logs found.</td></tr>` : logs.map(
    (log3) => `
            <tr class="hover:bg-slate-50">
              <td class="p-3"><input type="checkbox" value="${log3.id}" x-model="selectedLogs"></td>
              <td class="p-3 text-xs text-slate-500">${new Date(log3.created_at).toLocaleString()}</td>
              <td class="p-3 font-mono text-xs font-semibold text-slate-900">${log3.external_reference}</td>
              <td class="p-3 text-xs uppercase font-bold text-slate-600">${log3.gateway}</td>
              <td class="p-3 text-xs">${log3.phone}</td>
              <td class="p-3 text-xs font-semibold text-slate-800">TZS ${Number(log3.amount).toLocaleString()}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 text-xs font-bold rounded-full ${log3.status === "success" ? "bg-green-100 text-green-800" : log3.status === "failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}">
                  ${log3.status}
                </span>
              </td>
              <td class="p-3 text-right space-x-2">
                <button @click='openLogModal(${JSON.stringify(log3).replace(/'/g, "&apos;")})' class="text-indigo-600 hover:text-indigo-900 text-xs font-semibold">View</button>
                ${log3.status === "failed" ? `<button @click="retryLog(${log3.id})" class="text-amber-600 hover:text-amber-900 text-xs font-semibold">Retry</button>` : ""}
                <button @click="deleteLog(${log3.id})" class="text-red-600 hover:text-red-900 text-xs font-semibold">Delete</button>
              </td>
            </tr>`
  ).join("")}
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-4 py-3 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-600">
          <span>Showing Page ${currentPage} of ${lastPage} (${totalLogs} total logs)</span>
          <div class="space-x-1">
            ${currentPage > 1 ? `<a href="/?tab=logs&page=${currentPage - 1}&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-1 bg-white border rounded">Prev</a>` : ""}
            ${currentPage < lastPage ? `<a href="/?tab=logs&page=${currentPage + 1}&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-1 bg-white border rounded">Next</a>` : ""}
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div x-show="showModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" x-cloak>
      <div class="bg-white rounded-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-2">
          <h3 class="text-lg font-bold">Transaction Detail</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <template x-if="modalLog">
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded">
              <div><strong>External Ref:</strong> <span x-text="modalLog.external_reference"></span></div>
              <div><strong>Gateway Ref:</strong> <span x-text="modalLog.gateway_reference || 'N/A'"></span></div>
              <div><strong>Gateway:</strong> <span x-text="modalLog.gateway" class="uppercase"></span></div>
              <div><strong>Status:</strong> <span x-text="modalLog.status" class="font-bold"></span></div>
              <div><strong>Amount:</strong> TZS <span x-text="Number(modalLog.amount).toLocaleString()"></span></div>
              <div><strong>Phone:</strong> <span x-text="modalLog.phone"></span></div>
            </div>

            <div>
              <h4 class="font-bold mb-1">Raw Request Payload</h4>
              <pre class="bg-slate-900 text-slate-100 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_request, null, 2)"></pre>
            </div>

            <div>
              <h4 class="font-bold mb-1">Raw Response Payload</h4>
              <pre class="bg-slate-900 text-slate-100 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_response, null, 2)"></pre>
            </div>

            <div>
              <h4 class="font-bold mb-1">Callback Payload</h4>
              <pre class="bg-slate-900 text-slate-100 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.callback_payload, null, 2)"></pre>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <script>
    function toggleAll(e) {
      const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
      const checked = e.target.checked;
      checkboxes.forEach(cb => cb.checked = checked);
    }

    function openLogModal(log) {
      const el = document.querySelector('[x-data]');
      if (el && el._x_dataStack) {
        el._x_dataStack[0].modalLog = log;
        el._x_dataStack[0].showModal = true;
      }
    }

    async function deleteLog(id) {
      if (!confirm('Are you sure you want to delete this log?')) return;
      const res = await fetch('/logs/' + id, { method: 'DELETE' });
      if (res.ok) window.location.reload();
    }

    async function bulkDeleteSelected() {
      const checkboxes = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
      if (checkboxes.length === 0) return;
      if (!confirm('Delete selected ' + checkboxes.length + ' logs?')) return;
      const res = await fetch('/logs/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: checkboxes })
      });
      if (res.ok) window.location.reload();
    }

    async function retryLog(id) {
      const res = await fetch('/logs/retry/' + id, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Retry initiated');
      window.location.reload();
    }

    async function bulkRetryFailed() {
      if (!confirm('Retry all failed transactions?')) return;
      const res = await fetch('/logs/bulk-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all_failed' })
      });
      const data = await res.json();
      alert(data.message || 'Bulk retry completed');
      window.location.reload();
    }
  <\/script>`;
  return renderLayout({ title: "Gateway Settings & Logs", activeTab: "config", content, flashMessage });
}
__name(renderConfigView, "renderConfigView");

// src/views/emulatorView.js
function renderEmulatorView() {
  const content = `
  <div x-data="emulatorData()" x-init="init()" class="space-y-6">
    <!-- Notice & Setup Guide -->
    <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold text-amber-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Payment Emulator Sandbox</span>
          </h2>
          <p class="text-sm text-amber-800 mt-1">
            Test full payment flows without real gateway credentials or real money transactions.
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-amber-200 text-xs text-amber-900 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span class="font-bold block mb-1">Point AzamPay Base URLs to:</span>
          <code class="bg-amber-100 px-2 py-1 rounded font-mono text-[11px] block select-all"><span x-text="origin"></span>/api/emulator/azampay</code>
        </div>
        <div>
          <span class="font-bold block mb-1">Point Selcom Base URL to:</span>
          <code class="bg-amber-100 px-2 py-1 rounded font-mono text-[11px] block select-all"><span x-text="origin"></span>/api/emulator/selcom</code>
        </div>
      </div>
    </div>

    <!-- Live Transactions List -->
    <div class="bg-white shadow rounded-lg p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Sandbox Transactions</span>
          <span class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-semibold" x-text="transactions.length + ' Total'"></span>
        </h3>
        <button @click="fetchTransactions()" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border">
          \u{1F504} Refresh List
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th class="p-3 text-left">Time</th>
              <th class="p-3 text-left">Gateway</th>
              <th class="p-3 text-left">External ID</th>
              <th class="p-3 text-left">Phone</th>
              <th class="p-3 text-left">Amount</th>
              <th class="p-3 text-left">Status</th>
              <th class="p-3 text-right">Resolve Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <template x-if="transactions.length === 0">
              <tr>
                <td colspan="7" class="text-center py-8 text-slate-400 text-sm">
                  No emulator transactions captured yet. Send a payment initiation request to get started.
                </td>
              </tr>
            </template>
            <template x-for="txn in transactions" :key="txn.id">
              <tr class="hover:bg-slate-50">
                <td class="p-3 text-xs text-slate-500" x-text="new Date(txn.created_at).toLocaleTimeString()"></td>
                <td class="p-3 text-xs font-bold uppercase text-slate-700" x-text="txn.gateway"></td>
                <td class="p-3 font-mono text-xs font-semibold text-slate-900" x-text="txn.external_id"></td>
                <td class="p-3 text-xs" x-text="txn.phone"></td>
                <td class="p-3 text-xs font-semibold">TZS <span x-text="Number(txn.amount).toLocaleString()"></span></td>
                <td class="p-3">
                  <span class="px-2 py-0.5 text-xs font-bold rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-800': txn.status === 'pending',
                      'bg-green-100 text-green-800': txn.status === 'approved',
                      'bg-red-100 text-red-800': txn.status === 'rejected' || txn.status === 'timeout'
                    }"
                    x-text="txn.status">
                  </span>
                </td>
                <td class="p-3 text-right space-x-1">
                  <template x-if="txn.status === 'pending'">
                    <div class="inline-flex space-x-1">
                      <button @click="resolveTxn(txn.id, 'approve')" class="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded shadow-sm">
                        \u2713 Approve
                      </button>
                      <button @click="resolveTxn(txn.id, 'reject')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-sm">
                        \u2717 Reject
                      </button>
                      <button @click="resolveTxn(txn.id, 'timeout')" class="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded shadow-sm">
                        \u23F1 Timeout
                      </button>
                    </div>
                  </template>
                  <template x-if="txn.status !== 'pending'">
                    <span class="text-xs text-slate-400 italic">Resolved</span>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function emulatorData() {
      return {
        origin: window.location.origin,
        transactions: [],
        init() {
          this.fetchTransactions();
          setInterval(() => this.fetchTransactions(), 3000);
        },
        async fetchTransactions() {
          try {
            const res = await fetch('/api/emulator/transactions');
            if (res.ok) {
              this.transactions = await res.json();
            }
          } catch(e) {}
        },
        async resolveTxn(id, action) {
          const res = await fetch('/api/emulator/resolve/' + id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
          });
          const data = await res.json();
          if (data.error) {
            alert(data.error);
          } else {
            this.fetchTransactions();
          }
        }
      }
    }
  <\/script>`;
  return renderLayout({ title: "Emulator Sandbox", activeTab: "emulator", content });
}
__name(renderEmulatorView, "renderEmulatorView");

// src/views/selcomPayView.js
function renderSelcomPayView(transaction, orderId) {
  const content = `
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
    <div class="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
      <div>
        <h2 class="font-bold text-lg">Selcom Secure Pay</h2>
        <p class="text-xs text-blue-100">Sandbox Hosted Payment Checkout</p>
      </div>
      <div class="bg-white/20 p-2 rounded text-xs font-mono font-bold">
        SELCOM
      </div>
    </div>

    <div class="p-6 space-y-6">
      ${transaction ? `
      <div class="bg-slate-50 p-4 rounded-lg space-y-2 border text-sm">
        <div class="flex justify-between"><span class="text-slate-500">Order Ref:</span> <span class="font-mono font-bold">${transaction.external_id}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Customer:</span> <span class="font-semibold">${transaction.buyer_name || "Customer"}</span></div>
        <div class="flex justify-between"><span class="text-slate-500">Phone:</span> <span>${transaction.phone}</span></div>
        <div class="flex justify-between border-t pt-2 text-base font-bold"><span class="text-slate-700">Total Amount:</span> <span class="text-blue-600">TZS ${Number(transaction.amount).toLocaleString()}</span></div>
      </div>

      ${transaction.status === "pending" ? `
      <div class="space-y-3" x-data="{ loading: false }">
        <p class="text-xs text-slate-500 text-center">Select customer checkout simulation response:</p>
        <button @click="loading = true; resolve('${transaction.id}', 'approve')" class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition text-sm">
          Pay Now (Simulate Success)
        </button>
        <button @click="loading = true; resolve('${transaction.id}', 'reject')" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border transition text-xs">
          Cancel Payment (Simulate Failure)
        </button>
      </div>` : `
      <div class="bg-green-50 text-green-800 p-4 rounded-lg text-center text-sm font-semibold">
        Payment already processed with status: ${transaction.status}
      </div>`}
      ` : `
      <div class="text-center py-6 text-red-500 text-sm font-semibold">
        Order ${orderId} not found in emulator database.
      </div>`}
    </div>
  </div>

  <script>
    async function resolve(id, action) {
      const res = await fetch('/api/emulator/resolve/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment simulated: ' + action);
        window.location.href = '/emulator';
      } else {
        alert(data.error || 'Failed to simulate payment');
      }
    }
  <\/script>`;
  return renderLayout({ title: "Selcom Sandbox Checkout", activeTab: "emulator", content });
}
__name(renderSelcomPayView, "renderSelcomPayView");

// src/routes/web.js
var webRoutes = new Hono2();
var manager2 = new PaymentProcessorManager();
webRoutes.get("/", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const configs = await dbClient.getAllConfigs();
  const search = c.req.query("search") || "";
  const gateway = c.req.query("gateway") || "all";
  const status = c.req.query("status") || "all";
  const page = parseInt(c.req.query("page") || "1", 10);
  const logsData = await dbClient.getPaymentLogs({ search, gateway, status, page, perPage: 10 });
  return c.html(renderConfigView(configs, logsData, null, { search, gateway, status }));
});
webRoutes.post("/config/save", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.parseBody();
  if (body.test_gateway) {
    return handleConnectionTest(c, dbClient, body.test_gateway, body);
  }
  const keys = [
    "active_gateway",
    "webapp_callback_url",
    "selcom_base_url",
    "selcom_api_key",
    "selcom_secret_key",
    "selcom_vendor",
    "azampay_base_url",
    "azampay_auth_base_url",
    "azampay_client_id",
    "azampay_client_secret",
    "azampay_app_name",
    "azampay_api_key"
  ];
  for (const k of keys) {
    if (body[k] !== void 0) {
      await dbClient.setConfig(k, String(body[k]));
    }
  }
  const configs = await dbClient.getAllConfigs();
  const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
  const flash = { type: "success", text: "Configurations saved successfully!" };
  return c.html(renderConfigView(configs, logsData, flash));
});
async function handleConnectionTest(c, dbClient, gatewayToTest, formData) {
  if (gatewayToTest === "selcom") {
    const baseUrl = (formData.selcom_base_url || "").replace(/\/+$/, "");
    const apiKey = formData.selcom_api_key || "";
    const secretKey = formData.selcom_secret_key || "";
    const vendor = formData.selcom_vendor || "TILL123";
    if (!baseUrl || !apiKey || !secretKey) {
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "error",
          text: "Selcom Base URL, API Key, and Secret Key are required to run the connection test."
        })
      );
    }
    try {
      const selcom = await manager2.getGateway(dbClient, "selcom");
      const testData = { vendor, order_id: `TEST-${Date.now()}` };
      const headers = selcom.computeHeaders(testData, apiKey, secretKey);
      const res = await fetch(`${baseUrl}/checkout/create-order-minimal`, {
        method: "POST",
        headers,
        body: JSON.stringify(testData)
      });
      const resJson = await res.json().catch(() => null);
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      if (res.status === 401 || res.status === 403) {
        return c.html(
          renderConfigView(configs2, logsData2, {
            type: "error",
            text: `Connection successful, but credentials were rejected by Selcom (HTTP ${res.status}).`
          })
        );
      }
      const msg = resJson?.message || `Status Code ${res.status}`;
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "success",
          text: `Selcom API contacted successfully! Gateway responded: ${msg}`
        })
      );
    } catch (e) {
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "error",
          text: `Network connection to Selcom failed: ${e.message}`
        })
      );
    }
  }
  if (gatewayToTest === "azampay") {
    const authBaseUrl = (formData.azampay_auth_base_url || "").replace(/\/+$/, "");
    const clientId = formData.azampay_client_id || "";
    const clientSecret = formData.azampay_client_secret || "";
    const appName = formData.azampay_app_name || "";
    if (!authBaseUrl || !clientId || !clientSecret) {
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "error",
          text: "AzamPay Auth URL, Client ID, and Client Secret are required to run the test."
        })
      );
    }
    try {
      const res = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName, clientId, clientSecret })
      });
      const json = await res.json().catch(() => null);
      const token = json?.token || json?.data?.accessToken || json?.data?.token || json?.accessToken;
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      if (res.ok && (token || json?.success === true)) {
        return c.html(
          renderConfigView(configs2, logsData2, {
            type: "success",
            text: "AzamPay connection test successful! Access token generated successfully."
          })
        );
      }
      const err = json?.message || `Authentication failed (HTTP ${res.status})`;
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "error",
          text: `AzamPay authentication endpoint reached, but token generation failed: ${err}`
        })
      );
    } catch (e) {
      const configs2 = await dbClient.getAllConfigs();
      const logsData2 = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      return c.html(
        renderConfigView(configs2, logsData2, {
          type: "error",
          text: `Network connection to AzamPay failed: ${e.message}`
        })
      );
    }
  }
  const configs = await dbClient.getAllConfigs();
  const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
  return c.html(
    renderConfigView(configs, logsData, {
      type: "error",
      text: "Unsupported gateway test requested."
    })
  );
}
__name(handleConnectionTest, "handleConnectionTest");
webRoutes.get("/logs/:id", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param("id"), 10);
  const log3 = await dbClient.findPaymentLogById(id);
  if (!log3)
    return c.json({ error: "Log not found" }, 404);
  return c.json(log3);
});
webRoutes.delete("/logs/:id", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param("id"), 10);
  await dbClient.deletePaymentLog(id);
  return c.json({ success: true, message: "Transaction log deleted successfully." });
});
webRoutes.post("/logs/bulk-delete", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const count3 = await dbClient.bulkDeletePaymentLogs({ type: body.type, ids: body.ids });
  return c.json({ success: true, count: count3, message: `${count3} transaction log(s) deleted successfully.` });
});
webRoutes.post("/logs/retry/:id", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param("id"), 10);
  const log3 = await dbClient.findPaymentLogById(id);
  if (!log3)
    return c.json({ success: false, message: "Log not found" }, 404);
  let gateway;
  try {
    gateway = await manager2.getGateway(dbClient, log3.gateway);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 400);
  }
  const rawReq = log3.raw_request || {};
  const originUrl = new URL(c.req.url).origin;
  const result = await gateway.initiatePayment(
    dbClient,
    {
      amount: rawReq.amount || log3.amount,
      phone: rawReq.phone || log3.phone,
      email: rawReq.email || null,
      name: rawReq.name || null,
      external_reference: rawReq.external_reference || log3.external_reference,
      remarks: rawReq.remarks || "Retry transaction"
    },
    originUrl
  );
  await dbClient.updatePaymentLog(log3.id, {
    gateway_reference: result.gateway_reference || log3.gateway_reference,
    status: result.success ? "pending" : "failed",
    raw_response: result.raw_response || null
  });
  const updatedLog = await dbClient.findPaymentLogById(id);
  if (result.success) {
    return c.json({
      success: true,
      message: "Transaction retried successfully! Gateway status set to pending.",
      log: updatedLog
    });
  }
  return c.json(
    {
      success: false,
      message: result.error || "Gateway initiation failed during retry.",
      log: updatedLog
    },
    502
  );
});
webRoutes.post("/logs/bulk-retry", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const failedLogs = await dbClient.getAllPaymentLogsFiltered({ status: "failed" });
  let retriedCount = 0;
  let succeededCount = 0;
  let failedCount = 0;
  const originUrl = new URL(c.req.url).origin;
  for (const log3 of failedLogs) {
    retriedCount++;
    try {
      const gateway = await manager2.getGateway(dbClient, log3.gateway);
      const rawReq = log3.raw_request || {};
      const result = await gateway.initiatePayment(
        dbClient,
        {
          amount: rawReq.amount || log3.amount,
          phone: rawReq.phone || log3.phone,
          email: rawReq.email || null,
          name: rawReq.name || null,
          external_reference: rawReq.external_reference || log3.external_reference,
          remarks: rawReq.remarks || "Bulk retry transaction"
        },
        originUrl
      );
      await dbClient.updatePaymentLog(log3.id, {
        gateway_reference: result.gateway_reference || log3.gateway_reference,
        status: result.success ? "pending" : "failed",
        raw_response: result.raw_response || null
      });
      if (result.success) {
        succeededCount++;
      } else {
        failedCount++;
      }
    } catch (e) {
      failedCount++;
    }
  }
  return c.json({
    success: true,
    retried_count: retriedCount,
    succeeded_count: succeededCount,
    failed_count: failedCount,
    message: `Bulk retry completed. ${succeededCount} succeeded, ${failedCount} failed out of ${retriedCount} attempt(s).`
  });
});
webRoutes.get("/logs/export", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query("search") || "";
  const gateway = c.req.query("gateway") || "all";
  const status = c.req.query("status") || "all";
  const format = (c.req.query("format") || "csv").toLowerCase();
  const logs = await dbClient.getAllPaymentLogsFiltered({ search, gateway, status });
  const filenameDate = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\.-]/g, "");
  if (format === "json") {
    return c.text(JSON.stringify(logs, null, 2), 200, {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="transaction_logs_${filenameDate}.json"`
    });
  }
  const rows = [
    ["ID", "Date", "External Reference", "Gateway Reference", "Gateway", "Phone", "Amount (TZS)", "Status"]
  ];
  for (const log3 of logs) {
    rows.push([
      log3.id,
      log3.created_at || "",
      `"${String(log3.external_reference || "").replace(/"/g, '""')}"`,
      `"${String(log3.gateway_reference || "").replace(/"/g, '""')}"`,
      String(log3.gateway || "").toUpperCase(),
      `"${String(log3.phone || "").replace(/"/g, '""')}"`,
      log3.amount,
      log3.status
    ]);
  }
  const csvContent = rows.map((r) => r.join(",")).join("\n");
  return c.text(csvContent, 200, {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="transaction_logs_${filenameDate}.csv"`
  });
});
webRoutes.get("/emulator", (c) => {
  return c.html(renderEmulatorView());
});
webRoutes.get("/emulator/selcom-pay/:orderId", async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const orderId = c.req.param("orderId");
  const transaction = await dbClient.findEmulatorTxnByExtId(orderId, "selcom");
  return c.html(renderSelcomPayView(transaction, orderId));
});

// src/index.js
var app = new Hono2();
app.use("/api/*", cors());
app.route("/api", apiRoutes);
app.route("/api/emulator", emulatorApiRoutes);
app.route("/", webRoutes);
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ success: false, message: "API Endpoint Not Found" }, 404);
  }
  return c.text("404 Page Not Found", 404);
});
app.onError((err, c) => {
  console.error("Unhandled Error:", err);
  if (c.req.path.startsWith("/api/")) {
    return c.json({ success: false, message: "Internal Server Error", error: err.message }, 500);
  }
  return c.text(`500 Internal Server Error: ${err.message}`, 500);
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-4nz0al/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-4nz0al/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

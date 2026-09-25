// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setUint16),
      AD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      AE: x0 => globalThis.parseFloat(x0),
      AF: x0 => x0.pressure,
      AG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AH: x0 => x0.unlock(),
      AI: () => Date.now(),
      AJ: (x0,x1) => x0.getContext(x1),
      AK: (x0,x1) => x0.querySelector(x1),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint8),
      BD: x0 => x0.tabIndex,
      BE: (x0,x1) => x0.getComputedStyle(x1),
      BF: x0 => x0.tiltY,
      BG: x0 => x0.now(),
      BH: (x0,x1) => x0.lock(x1),
      BI: x0 => new WeakRef(x0),
      BJ: (x0,x1) => new OffscreenCanvas(x0,x1),
      BK: (x0,x1) => x0.createElement(x1),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setInt8),
      CD: (x0,x1) => x0.contains(x1),
      CE: x0 => x0.documentElement,
      CF: x0 => x0.tiltX,
      CG: x0 => x0.performance,
      CH: x0 => x0.orientation,
      CI: x0 => x0.deref(),
      CJ: x0 => x0.allocationSize(),
      CK: (o, a) => o + a,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.getInt8),
      DD: x0 => x0.activeElement,
      DE: x0 => x0.computedStyleMap(),
      DF: x0 => x0.pointerType,
      DG: (d, digits) => d.toFixed(digits),
      DH: (x0,x1) => x0.querySelector(x1),
      DI: () => globalThis.WeakRef,
      DJ: (x0,x1) => x0.copyTo(x1),
      DK: x0 => x0.children,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      ED: x0 => x0.parentNode,
      EE: (x0,x1) => x0.get(x1),
      EF: x0 => x0.pointerId,
      EG: x0 => x0.maxHeight,
      EH: (x0,x1) => { x0.title = x1 },
      EI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      EJ: (x0,x1) => { x0.height = x1 },
      EK: (x0,x1) => { x0.id = x1 },
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      FD: x0 => x0.tagName,
      FE: (o, p) => p in o,
      FF: x0 => x0.getCoalescedEvents(),
      FG: x0 => x0.maxWidth,
      FH: (x0,x1) => x0.vibrate(x1),
      FI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      FJ: (x0,x1) => { x0.width = x1 },
      FK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.target,
      GE: (x0,x1) => { x0.textContent = x1 },
      GF: (x0,x1) => x0.getModifierState(x1),
      GG: x0 => x0.minHeight,
      GH: x0 => x0.arrayBuffer(),
      GI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      GJ: (x0,x1) => x0.toDataURL(x1),
      GK: x0 => x0.click(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.clientY,
      HE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HF: s => s.trimLeft(),
      HG: x0 => x0.minWidth,
      HH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      HI: (a, s, e) => a.slice(s, e),
      HJ: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      HK: (x0,x1) => x0.removeChild(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.clientX,
      IE: x0 => x0.matches,
      IF: s => s.toUpperCase(),
      IG: (x0,x1) => x0.removeProperty(x1),
      IH: x0 => x0.status,
      II: x0 => x0.requestFullscreen(),
      IJ: (x0,x1) => x0.getContext(x1),
      IK: x0 => x0.firstChild,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      JD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      JE: (x0,x1) => x0.matchMedia(x1),
      JF: (x0,x1) => x0[x1],
      JG: (x0,x1) => x0.add(x1),
      JH: (x0,x1) => x0.fetch(x1),
      JI: x0 => x0.documentElement,
      JJ: x0 => x0.format,
      JK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.getBoundingClientRect(),
      KE: x0 => x0.matches,
      KF: x0 => x0.length,
      KG: x0 => x0.data,
      KH: x0 => x0.content,
      KI: () => globalThis.document,
      KJ: () => new FileReader(),
      KK: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      LD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      LE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      LF: x0 => x0.pop(),
      LG: (x0,x1) => { x0.scrollTop = x1 },
      LH: x0 => x0.document,
      LI: x0 => x0.exitFullscreen(),
      LJ: (x0,x1) => x0.readAsArrayBuffer(x1),
      LK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      MD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      ME: f => f.dartFunction,
      MF: x0 => x0.flags,
      MG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      MH: () => typeof dartUseDateNowForTicks !== "undefined",
      MI: (x0,x1) => x0.revokeObjectURL(x1),
      MJ: x0 => x0.result,
      MK: (x0,x1) => x0.item(x1),
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      ND: Date.now,
      NE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NF: (a, s) => a.join(s),
      NG: (x0,x1) => { x0.value = x1 },
      NH: () => Date.now(),
      NI: (x0,x1) => { x0.src = x1 },
      NJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NK: x0 => globalThis.URL.createObjectURL(x0),
      O: o => o === undefined,
      OB: x0 => new Int32Array(x0),
      OC: (x0,x1) => x0.querySelector(x1),
      OD: (handle) => clearTimeout(handle),
      OE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      OF: (x0,x1) => x0.error(x1),
      OG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      OH: () => 1000 * performance.now(),
      OI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      OJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      OK: x0 => ({type: x0}),
      P: (x0,x1) => x0.exec(x1),
      PB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      PC: (x0,x1) => x0.item(x1),
      PD: (x0,x1) => x0.closest(x1),
      PE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      PF: () => globalThis.console,
      PG: (x0,x1) => { x0.value = x1 },
      PH: x0 => new Uint8Array(x0),
      PI: x0 => x0.naturalHeight,
      PJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      PK: (x0,x1) => new Blob(x0,x1),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => new Uint32Array(x0),
      QC: x0 => x0.length,
      QD: x0 => x0.bottom,
      QE: (o, i) => o[i],
      QF: s => s.trimRight(),
      QG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      QH: (x0,x1,x2) => x0.slice(x1,x2),
      QI: x0 => x0.naturalWidth,
      QJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QK: x0 => x0.size,
      R: o => o,
      RB: x0 => new Float32Array(x0),
      RC: (x0,x1) => x0.querySelectorAll(x1),
      RD: x0 => x0.top,
      RE: o => o.length,
      RF: x0 => x0.blur(),
      RG: x0 => x0.value,
      RH: (x0,x1) => x0.decode(x1),
      RI: x0 => x0.decode(),
      RJ: () => new XMLHttpRequest(),
      RK: x0 => x0.name,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      SC: (x0,x1) => x0.getAttribute(x1),
      SD: x0 => x0.right,
      SE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      SF: x0 => x0.button,
      SG: x0 => x0.selectionDirection,
      SH: (x0,x1) => x0.adoptText(x1),
      SI: (x0,x1) => { x0.decoding = x1 },
      SJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      SK: x0 => x0.type,
      T: o => o instanceof RegExp,
      TB: x0 => new Float64Array(x0),
      TC: x0 => x0.remove(),
      TD: x0 => x0.left,
      TE: x0 => x0.language,
      TF: x0 => x0.innerHeight,
      TG: x0 => x0.selectionStart,
      TH: x0 => x0.first(),
      TI: (x0,x1) => { x0.crossOrigin = x1 },
      TJ: x0 => x0.send(),
      TK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      U: (string, times) => string.repeat(times),
      UB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      UC: (x0,x1) => x0.appendChild(x1),
      UD: x0 => x0.clientY,
      UE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      UF: x0 => x0.innerWidth,
      UG: x0 => x0.selectionEnd,
      UH: x0 => x0.next(),
      UI: (x0,x1) => x0.createObjectURL(x1),
      UJ: x0 => x0.type,
      UK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      V: o => o,
      VB: x0 => new ArrayBuffer(x0),
      VC: (x0,x1) => x0.append(x1),
      VD: x0 => x0.clientX,
      VE: () => globalThis.window.FinalizationRegistry,
      VF: x0 => x0.height,
      VG: x0 => x0.value,
      VH: x0 => x0.current(),
      VI: x0 => x0.URL,
      VJ: x0 => x0.response,
      VK: x0 => x0.length,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      WC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      WD: x0 => x0.changedTouches,
      WE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WF: x0 => x0.width,
      WG: x0 => x0.selectionDirection,
      WH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      WI: x0 => new Blob(x0),
      WJ: (x0,x1) => { x0.responseType = x1 },
      WK: x0 => x0.files,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new DataView(x0,x1,x2),
      XC: x0 => x0.style,
      XD: x0 => x0.offsetY,
      XE: x0 => new window.FinalizationRegistry(x0),
      XF: x0 => x0.clientHeight,
      XG: x0 => x0.selectionStart,
      XH: x0 => x0.v8BreakIterator,
      XI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      XJ: x0 => x0.vendor,
      XK: x0 => x0.target,
      Y: x0 => x0.unicode,
      YB: (o, p) => o[p],
      YC: x0 => x0.debugShowSemanticsNodes,
      YD: x0 => x0.offsetX,
      YE: (x0,x1) => x0.unregister(x1),
      YF: x0 => x0.clientWidth,
      YG: x0 => x0.selectionEnd,
      YH: () => globalThis.Intl,
      YI: x0 => new window.ImageDecoder(x0),
      YJ: x0 => x0.navigator,
      YK: (x0,x1) => { x0.display = x1 },
      Z: x0 => x0.ignoreCase,
      ZB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      ZC: (x0,x1) => x0.warn(x1),
      ZD: x0 => x0.type,
      ZE: (x0,x1) => x0.contains(x1),
      ZF: (x0,x1) => { x0.content = x1 },
      ZG: x0 => x0.keyCode,
      ZH: (x0,x1) => x0.segment(x1),
      ZI: x0 => x0.name,
      ZJ: () => globalThis.window,
      ZK: x0 => x0.style,
      a: x0 => x0.multiline,
      aB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      aC: x0 => x0.console,
      aD: x0 => x0.maxTouchPoints,
      aE: (s) => +s,
      aF: (x0,x1) => { x0.name = x1 },
      aG: (x0,x1) => x0.scrollIntoView(x1),
      aH: x0 => x0.index,
      aI: x0 => x0.repetitionCount,
      aJ: x0 => new Blob(x0),
      aK: (x0,x1) => { x0.accept = x1 },
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: o => o.byteOffset,
      bC: () => globalThis.window,
      bD: x0 => x0.platform,
      bE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      bF: x0 => x0.head,
      bG: x0 => x0.multiViewEnabled,
      bH: x0 => x0.next(),
      bI: x0 => x0.frameCount,
      bJ: x0 => globalThis.fetch(x0),
      bK: (x0,x1) => { x0.multiple = x1 },
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.buffer,
      cC: (o, c) => o instanceof c,
      cD: x0 => x0.body,
      cE: s => s.trim(),
      cF: (x0,x1) => x0.removeChild(x1),
      cG: (x0,x1) => x0.replaceWith(x1),
      cH: x0 => x0.value,
      cI: x0 => x0.selectedTrack,
      cJ: x0 => x0.arrayBuffer(),
      cK: (x0,x1) => { x0.draggable = x1 },
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: Function.prototype.call.bind(DataView.prototype.getUint8),
      dC: (string, token) => string.split(token),
      dD: () => globalThis.document,
      dE: x0 => x0.classList,
      dF: x0 => x0.firstChild,
      dG: (x0,x1) => { x0.type = x1 },
      dH: x0 => x0.done,
      dI: x0 => x0.completed,
      dJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      dK: (x0,x1) => { x0.type = x1 },
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: (b, o) => new DataView(b, o),
      eC: o => o instanceof Array,
      eD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      eE: x0 => x0.preventDefault(),
      eF: x0 => x0.viewConstraints,
      eG: (x0,x1) => { x0.className = x1 },
      eH: (o, m, a) => o[m].apply(o, a),
      eI: x0 => x0.ready,
      eJ: x0 => x0.id,
      eK: x0 => x0.length,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o, l) => new DataView(b, o, l),
      fC: (a, i) => a[i],
      fD: x0 => x0.hasFocus(),
      fE: x0 => x0.parent,
      fF: x0 => x0.hostElement,
      fG: (x0,x1) => { x0.tabIndex = x1 },
      fH: x0 => x0.iterator,
      fI: x0 => x0.tracks,
      fJ: x0 => x0.offsetHeight,
      fK: x0 => x0.getReader(),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      gC: a => a.length,
      gD: x0 => x0.relatedTarget,
      gE: x0 => x0.timeStamp,
      gF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gG: (x0,x1) => { x0.name = x1 },
      gH: () => globalThis.Symbol,
      gI: x0 => x0.close(),
      gJ: x0 => x0.offsetWidth,
      gK: x0 => x0.value,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      hC: (x0,x1) => x0.test(x1),
      hD: x0 => x0.shiftKey,
      hE: (x0,x1) => x0.hasAttribute(x1),
      hF: x0 => ({runApp: x0}),
      hG: (x0,x1) => { x0.placeholder = x1 },
      hH: (x0,x1) => new Intl.Segmenter(x0,x1),
      hI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      hJ: x0 => x0.stopPropagation(),
      hK: x0 => x0.done,
      i: x0 => new Promise(x0),
      iB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      iC: x0 => x0.userAgent,
      iD: (decoder, codeUnits) => decoder.decode(codeUnits),
      iE: x0 => x0.buttons,
      iF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      iG: (x0,x1) => { x0.autocomplete = x1 },
      iH: x0 => x0.Segmenter,
      iI: (x0,x1) => x0.decode(x1),
      iJ: x0 => x0.disabled,
      iK: x0 => x0.read(),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: (t, s) => t.set(s),
      jC: x0 => x0.navigator,
      jD: () => new TextDecoder("utf-8", {fatal: true}),
      jE: x0 => x0.ctrlKey,
      jF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      jG: (x0,x1) => { x0.name = x1 },
      jH: x0 => x0.buffer,
      jI: x0 => x0.displayHeight,
      jJ: (x0,x1) => { x0.min = x1 },
      jK: x0 => x0.body,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      kC: Function.prototype.call.bind(String.prototype.toLowerCase),
      kD: () => new TextDecoder("utf-8", {fatal: false}),
      kE: x0 => x0.y,
      kF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      kG: (x0,x1) => { x0.placeholder = x1 },
      kH: x0 => x0.wasmMemory,
      kI: x0 => x0.displayWidth,
      kJ: (x0,x1) => { x0.max = x1 },
      kK: x0 => x0.assetBase,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      lC: Object.is,
      lD: (a, i, v) => a[i] = v,
      lE: x0 => x0.x,
      lF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      lG: (x0,x1) => { x0.action = x1 },
      lH: () => globalThis.window._flutter_skwasmInstance,
      lI: x0 => x0.duration,
      lJ: (x0,x1) => { x0.disabled = x1 },
      lK: x0 => x0.loader,
      m: o => [o],
      mB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      mC: x0 => x0.vendor,
      mD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      mE: x0 => x0.scrollTop,
      mF: x0 => x0.history,
      mG: (x0,x1) => { x0.method = x1 },
      mH: () => new TextDecoder(),
      mI: x0 => x0.image,
      mJ: (x0,x1) => { x0.scrollLeft = x1 },
      mK: () => globalThis._flutter,
      n: (o0, o1) => [o0, o1],
      nB: Function.prototype.call.bind(DataView.prototype.getUint32),
      nC: (x0,x1) => x0.createTextNode(x1),
      nD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      nE: x0 => x0.offsetTop,
      nF: x0 => x0.search,
      nG: (x0,x1) => { x0.noValidate = x1 },
      nH: (x0,x1) => x0.getRandomValues(x1),
      nI: () => globalThis.window.ImageDecoder,
      nJ: (x0,x1) => { x0.spellcheck = x1 },
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      oC: (x0,x1) => { x0.id = x1 },
      oD: x0 => x0.visibilityState,
      oE: x0 => x0.scrollLeft,
      oF: x0 => x0.location,
      oG: (x0,x1) => x0.removeAttribute(x1),
      oH: () => globalThis.crypto,
      oI: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      oJ: (x0,x1) => { x0.disabled = x1 },
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: Function.prototype.call.bind(DataView.prototype.getInt32),
      pC: (x0,x1) => { x0.nonce = x1 },
      pD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      pE: x0 => x0.offsetLeft,
      pF: x0 => x0.pathname,
      pG: x0 => x0.isConnected,
      pH: l => new DataView(new ArrayBuffer(l)),
      pI: x0 => x0.arrayBuffer(),
      pJ: x0 => x0.canvasKitMaximumSurfaces,
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      qC: x0 => x0.nonce,
      qD: x0 => x0.disconnect(),
      qE: x0 => x0.offsetParent,
      qF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      qG: x0 => x0.click(),
      qH: (a, i) => a.splice(i, 1),
      qI: (x0,x1) => x0.transferFromImageBitmap(x1),
      qJ: x0 => x0.hostElement,
      r: (o, p) => o[p],
      rB: o => o instanceof Uint16Array,
      rC: () => globalThis.window.flutterConfiguration,
      rD: x0 => new Intl.Locale(x0),
      rE: (o, p, r) => o.replaceAll(p, () => r),
      rF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      rG: (x0,x1) => x0.getElementsByClassName(x1),
      rH: a => a.pop(),
      rI: x0 => x0.height,
      rJ: x0 => x0.location,
      s: () => globalThis,
      sB: Function.prototype.call.bind(DataView.prototype.getUint16),
      sC: (x0,x1) => x0.attachShadow(x1),
      sD: x0 => x0.region,
      sE: x0 => x0.deltaMode,
      sF: o => Object.keys(o),
      sG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      sH: (map, o, v) => map.set(o, v),
      sI: x0 => x0.width,
      sJ: (x0,x1) => x0.getModifierState(x1),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: o => o instanceof Int16Array,
      tC: (x0,x1) => x0.createElement(x1),
      tD: x0 => x0.script,
      tE: x0 => x0.deltaY,
      tF: x0 => x0.state,
      tG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      tH: (map, o) => map.get(o),
      tI: x0 => x0.rasterEndMilliseconds,
      tJ: x0 => x0.metaKey,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: Function.prototype.call.bind(DataView.prototype.getInt16),
      uC: x0 => x0.scale,
      uD: x0 => x0.language,
      uE: x0 => x0.deltaX,
      uF: x0 => x0.hash,
      uG: (x0,x1) => x0.dispatchEvent(x1),
      uH: () => new WeakMap(),
      uI: x0 => x0.rasterStartMilliseconds,
      uJ: x0 => x0.altKey,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: o => o instanceof Uint8ClampedArray,
      vC: x0 => x0.visualViewport,
      vD: x0 => x0.languages,
      vE: x0 => x0.wheelDeltaY,
      vF: x0 => x0.state,
      vG: (x0,x1) => x0.createEvent(x1),
      vH: x0 => x0.debugSkipFontRetryDelay,
      vI: x0 => x0.imageBitmaps,
      vJ: x0 => x0.ctrlKey,
      w: (l, r) => l === r,
      wB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      wC: x0 => x0.devicePixelRatio,
      wD: (x0,x1) => x0.observe(x1),
      wE: x0 => x0.wheelDeltaX,
      wF: (x0,x1) => x0.go(x1),
      wG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      wH: (x0,x1,x2) => x0.set(x1,x2),
      wI: (x0,x1) => { x0.height = x1 },
      wJ: x0 => x0.isComposing,
      x: x0 => x0.random(),
      xB: Function.prototype.call.bind(DataView.prototype.setInt32),
      xC: x0 => x0.height,
      xD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xE: x0 => x0.key,
      xF: x0 => x0.parentElement,
      xG: x0 => x0.readText(),
      xH: x0 => x0.fontFallbackBaseUrl,
      xI: (x0,x1) => { x0.width = x1 },
      xJ: x0 => x0.code,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setUint32),
      yC: x0 => x0.width,
      yD: x0 => new ResizeObserver(x0),
      yE: x0 => x0.identifier,
      yF: (x0,x1) => x0.querySelectorAll(x1),
      yG: x0 => x0.clipboard,
      yH: (handle) => clearInterval(handle),
      yI: x0 => x0.convertToBlob(),
      yJ: x0 => x0.repeat,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setInt16),
      zC: x0 => x0.screen,
      zD: (x0,x1) => x0.getPropertyValue(x1),
      zE: x0 => x0.touches,
      zF: (x0,x1) => x0.requestAnimationFrame(x1),
      zG: (x0,x1) => x0.writeText(x1),
      zH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      zI: (x0,x1,x2) => new ImageData(x0,x1,x2),
      zJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

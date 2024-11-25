import "@testing-library/jest-dom";
import { URL } from "node:url";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.URL = URL;

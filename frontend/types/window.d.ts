declare global {
  interface Window {
    streamForCamera?: MediaStream | null;
    streamForBarcode?: MediaStream | null;
  }
}

export {}; 
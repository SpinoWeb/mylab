export {};

declare global {
  interface Console {
    olog: (...args: any[]) => void;
  }
}

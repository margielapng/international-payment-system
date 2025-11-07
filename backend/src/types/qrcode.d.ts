// lightweight declarations that include common methods
declare module "qrcode" {
  const QRCode: {
    toDataURL(data: string, options?: any): Promise<string>;
    toString(data: string, options?: any): Promise<string>;
    toFile(path: string, data: string, options?: any): Promise<void>;
    toFileStream(stream: import("stream").Writable, data: string, options?: any): Promise<void>;
    [key: string]: any;
  };
  export default QRCode;
}

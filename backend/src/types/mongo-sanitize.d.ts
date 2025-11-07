// src/types/mongo-sanitize.d.ts
declare module "mongo-sanitize" {
  export default function mongoSanitize<T = any>(input: T): T;
}

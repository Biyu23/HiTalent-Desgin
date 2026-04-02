// src/typings.d.ts

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';

declare module '*.svg' {
  /**
   * A path to the SVG file
   */
  const path: `${string}.svg`;
  export = path;
}

declare module '*.module.css' {
  /**
   * A record of class names to their corresponding CSS module classes
   */
  const classes: { readonly [key: string]: string };
  export = classes;
}

/**
 * Environment Variables
 * Type-safe access to environment variables via Bun.env
 */
declare module 'bun' {
  interface Env {
    DATABASE_URL: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PERSPECTIVE_TOKEN: string;
    }
  }
}

export {}
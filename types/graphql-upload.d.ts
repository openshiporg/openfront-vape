// The installed runtime is graphql-upload 15 (.js); its installed v17 types
// only describe .mjs exports. This declaration matches v15 processRequest.
declare module 'graphql-upload/processRequest.js' {
  import type { IncomingMessage, ServerResponse } from 'node:http';
  export default function processRequest(
    request: IncomingMessage,
    response: ServerResponse,
    options?: { maxFieldSize?: number; maxFileSize?: number; maxFiles?: number },
  ): Promise<Record<string, unknown> | Array<Record<string, unknown>>>;
}

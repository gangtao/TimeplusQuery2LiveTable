const DEFAULT_ENV = {
  host: 'http://localhost',
  tenant: null,
  apiKey: null,
}

let currentEnv: Env = DEFAULT_ENV;

export interface Env {
  /**
   * Host address of the Timeplus server. Make sure you include the scheme (http or https)
   * e.g. https://us.timeplus.cloud or http://localhost
   */
  host: string | undefined;

  /**
   * Port number
   */
  port?: number;

  /**
   * Tenant ID (not tenant name)
   */
  tenant: string | null | undefined;

  /**
   * Api key
   */
  apiKey: string | null | undefined;
}

export const SetEnv = (env: Env) => {
  currentEnv = env;
}

export const Env = () => {
  return {
    BuildUrl(apiVersion: string, resourceName: string): string {
      let url = currentEnv.host;
      if (currentEnv.port) {
        url += `:${currentEnv.port}`;
      }
      const paths = [url];
      if (currentEnv.tenant) {
        paths.push(currentEnv.tenant)
      }
      paths.push('api', apiVersion, resourceName)
      return paths.join('/');
    },
    AuthKey(): string | null | undefined {
      return currentEnv.apiKey;
    }
  }
}

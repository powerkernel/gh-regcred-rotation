import k8s = require('@kubernetes/client-node');
import { HttpError } from '@kubernetes/client-node';
import { getAppLogin, getAppToken } from './github';
import { updateRegcred, createRegcred } from './k8s';

const checkEnv = () => {
  if (!process.env.GITHUB_APP_ID) {
    throw new Error('GITHUB_APP_ID is not set');
  }
  if (!process.env.INSTALLATION_ID) {
    throw new Error('INSTALLATION_ID is not set');
  }
  if (!process.env.REGUSTRY_SECRET_NAME) {
    throw new Error('REGUSTRY_SECRET_NAME is not set');
  }
  if (!process.env.B64_GITHUB_APP_KEY) {
    throw new Error('B64_GITHUB_APP_KEY is not set');
  }
  if (!process.env.K8S_NAMESPACE) {
    throw new Error('K8S_NAMESPACE is not set');
  }
};

/* run */

(async () => {
  checkEnv();

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const login = await getAppLogin();
  const token = await getAppToken();
  try {
    const regcred = await k8sApi.readNamespacedSecret(process.env.REGUSTRY_SECRET_NAME!, process.env.K8S_NAMESPACE!);
    if (regcred.response.statusCode === 200) {
      console.log('regcred found, updating...');
      await updateRegcred(k8sApi, login, token);
      process.exit(0);
    }
  } catch (e: unknown) {
    if (e instanceof HttpError) {
      if (e.response.statusCode === 404) {
        console.log('regcred not found, creating...');
        await createRegcred(k8sApi, login, token);
        process.exit(0);
      }
    } else {
      console.error(e);
      process.exit(1);
    }
  }
})();

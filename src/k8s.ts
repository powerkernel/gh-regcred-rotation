import k8s = require('@kubernetes/client-node');
const generateDockerConfig = (username: string, password: string): string => {
  const dockerConfig = {
    auths: {
      'ghcr.io': {
        username: username,
        password: password,
        auth: Buffer.from(`${username}:${password}`).toString('base64'),
      },
    },
  };
  return Buffer.from(JSON.stringify(dockerConfig)).toString('base64');
};

const createRegcred = async (k8sApi: k8s.CoreV1Api, login: string, token: string) => {
  const regcred = await k8sApi.createNamespacedSecret(process.env.K8S_NAMESPACE!, {
    apiVersion: 'v1',
    data: {
      '.dockerconfigjson': generateDockerConfig(login, token),
    },
    kind: 'Secret',
    metadata: {
      name: process.env.REGUSTRY_SECRET_NAME!,
      namespace: process.env.K8S_NAMESPACE,
    },
    type: 'kubernetes.io/dockerconfigjson',
  });
  if (regcred.response.statusCode === 201) {
    console.log('regcred created');
  }
};

const updateRegcred = async (k8sApi: k8s.CoreV1Api, login: string, token: string) => {
  const regcred = await k8sApi.patchNamespacedSecret(
    process.env.REGUSTRY_SECRET_NAME!,
    process.env.K8S_NAMESPACE!,
    {
      data: {
        '.dockerconfigjson': generateDockerConfig(login, token),
      },
    },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    {
      headers: { 'content-type': 'application/merge-patch+json' },
    }
  );
  if (regcred.response.statusCode === 200) {
    console.log('regcred updated');
  }
};

export { createRegcred, updateRegcred };

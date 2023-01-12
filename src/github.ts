import axios from 'axios';
import jwt from 'jsonwebtoken';
import { InstalltionAccessTokenResponse, InstalltionResponse } from './types';

const generateJwt = (): string => {
  const key = Buffer.from(process.env.B64_GITHUB_APP_KEY!, 'base64');
  const now = Math.round(+new Date() / 1000);
  const payload = {
    iss: process.env.GITHUB_APP_ID,
    iat: now,
    exp: now + 500,
  };
  return jwt.sign(payload, key, { algorithm: 'RS256' });
};

const getAppToken = async () => {
  const jwtoken = generateJwt();
  const headers = {
    Authorization: `Bearer ${jwtoken}`,
    Accept: 'application/vnd.github+json',
  };
  try {
    const res = await axios.post<InstalltionAccessTokenResponse>(
      `https://api.github.com/app/installations/${process.env.INSTALLATION_ID!}/access_tokens`,
      {},
      {
        headers,
      }
    );
    return res.data.token;
  } catch (e) {
    console.error('failed to get app token');
    throw e;
  }
};

const getAppLogin = async () => {
  const jwtoken = generateJwt();
  const headers = {
    Authorization: `Bearer ${jwtoken}`,
    Accept: 'application/vnd.github+json',
  };
  try {
    const res = await axios.get<InstalltionResponse>(
      `https://api.github.com/app/installations/${process.env.INSTALLATION_ID!}`,
      {
        headers,
      }
    );
    return res.data.account.login;
  } catch (e) {
    console.error('failed to get app login');
    throw e;
  }
};

export { getAppLogin, getAppToken };

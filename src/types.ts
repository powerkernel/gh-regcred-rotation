type InstalltionAccessTokenResponse = {
  token: string;
  expires_at: string;
};

type InstalltionResponse = {
  id: number;
  account: {
    login: string;
  };
};

export { InstalltionAccessTokenResponse, InstalltionResponse };

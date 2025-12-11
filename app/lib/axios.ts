import axios, { AxiosRequestConfig } from "axios";

export const api = (
  baseURL: string,
  options?: Partial<Omit<AxiosRequestConfig, "baseURL">>
) => {
  return axios.create({
    ...options,
    baseURL,
  });
};

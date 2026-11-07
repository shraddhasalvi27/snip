import axios,{AxiosError} from "axios";
const axiosInstance = axios.create({
      baseURL: "http://localhost:3001",
      headers: {
    "Content-Type": "application/json",
  },
})
export interface CreateLinkPayload {
  url: string;
  alias?: string;
  expiresAt?: string;
}

export const createLink = (payload: CreateLinkPayload) => {
  return axiosInstance.post("/app/links/", payload); // keep your existing axios call as it is
};
// export const createLink = async(data:{url:string,alias:string,expiresAt:string})=> axiosInstance.post("/app/links/",data);
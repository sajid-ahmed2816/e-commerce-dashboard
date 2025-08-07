import { post } from "../index";
import Route from "./Routes";

const UploadService = {
  uploadImage: async (obj) => {
    const result = await post(Route.uploadImage, obj);
    return result;
  },
};

export default UploadService;
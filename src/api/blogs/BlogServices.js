import { post, get, patch, deleted } from "../index";
import Routes from "./Routes";

const BlogServices = {
    createBlog: async (obj) => {
        const result = await post(Routes.createBlog, obj);
        return result;
    },

    getBlogs: async (params) => {
        const result = await get(Routes.getBlogs, params);
        return result;
    },

    updateBlog: async (id, obj) => {
        const result = await patch(Routes.updateBlog + `/${id}`, obj);
        return result;
    },

    updateStatus: async (id, obj) => {
        const result = await patch(Routes.updateStatus + `/${id}`, obj);
        return result;
    },

    deleteBlog: async (id) => {
        const result = await deleted(Routes.deleteBlog + `/${id}`);
        return result;
    },
};

export default BlogServices;
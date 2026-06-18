import Dashboard from "../views/Dashboard";
import Orders from "../views/Orders";
import Products from "../views/Products/all_products";
import CreateProduct from "../views/Products/create_product";
import Categories from "../views/Categories";
import Banners from "../views/Banners";
import Users from "../views/Users";
import Blogs from "../views/Blogs/all_blogs";
import UpdateProduct from "../views/Products/update_product";
import Sizes from "../views/Sizes";
import Offers from "../views/Offers";
import CreateBlog from "../views/Blogs/create_blog";
import UpdateBlog from "../views/Blogs/update_blog";
import OrderDetail from "../views/Orders/order_detail";

const adminRoutes = [
  {
    path: "/",
    component: <Dashboard />,
  },
  {
    path: "/orders",
    component: <Orders />,
  },
  {
    path: "/orders/order-detail/:id",
    component: <OrderDetail />,
  },
  {
    path: "/products/create-product",
    component: <CreateProduct />,
  },
  {
    path: "/products/update-product/:id",
    component: <UpdateProduct />,
  },
  {
    path: "/products",
    component: <Products />,
  },
  {
    path: "/categories",
    component: <Categories />,
  },
  {
    path: "/offers",
    component: <Offers />,
  },
  {
    path: "/sizes",
    component: <Sizes />,
  },
  {
    path: "/banners",
    component: <Banners />,
  },
  {
    path: "/users",
    component: <Users />,
  },
  {
    path: "/blogs",
    component: <Blogs />,
  },
  {
    path: "/blogs/create-blog",
    component: <CreateBlog />,
  },
  {
    path: "/blogs/update-blog/:id",
    component: <UpdateBlog />,
  },
];

export default adminRoutes;

import Dashboard from "../views/Dashboard";
import Orders from "../views/Orders";
import Products from "../views/Products/all_products";
import CreateProduct from "../views/Products/create_product";
import Categories from "../views/Categories";
import Banners from "../views/Banners";
import Users from "../views/Users";
import About from "../views/About";
import Blogs from "../views/Blogs";
import UpdateProduct from "../views/Products/update_product";
import Sizes from "../views/Sizes";
import Offers from "../views/Offers";

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
    path: "/about",
    component: <About />,
  },
  {
    path: "/blogs",
    component: <Blogs />,
  },
];

export default adminRoutes;

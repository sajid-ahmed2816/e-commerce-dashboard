import Dashboard from "../views/Dashboard";
import Orders from "../views/Orders";
import Products from "../views/Products/all_products";
import CreateProduct from "../views/Products/create_product";
import Categories from "../views/Categories/all_categories";
import CreateCategory from "../views/Categories/create_category";

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
    path: "/create-product",
    component: <CreateProduct />,
  },
  {
    path: "/products",
    component: <Products />,
  },
  {
    path: "/create-category",
    component: <CreateCategory />,
  },
  {
    path: "/categories",
    component: <Categories />,
  },
];

export default adminRoutes;

import Dashboard from "../views/Dashboard/Dashboard";
import Customers from "../views/Customers/Customers";
import Orders from "../views/Orders/Orders";
import Products from "../views/Products/Products";

const adminRoutes = [
  {
    path: "/",
    component: <Dashboard />,
  },
  {
    path: "/customers",
    component: <Customers />,
  },
  {
    path: "/orders",
    component: <Orders />,
  },
  {
    path: "/products",
    component: <Products />,
  },
];

export default adminRoutes;

import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Restaurants } from "../pages/client/restaurants";
import { NotFound } from "../pages/404";
import { Header } from "../components/header";
import { useMe } from "../hooks/useMe";
import { ConfirmEmail } from "../pages/users/confirm-email";
import { EditProfile } from "../pages/users/edit-profile";
import { Search } from "../pages/client/search";
import { Category } from "../pages/client/category";
import { Restaurant } from "../pages/client/restaurant";
import { MyRestaurants } from "../pages/owner/my-restraurants";
import { AddRestaurant } from "../pages/owner/add-restaurants";


const clientRoutes = [
  {
    path: "/",
    component: <Restaurants />,
  },
  {
    path: "/search",
    component: <Search />,
  },
  {
    path: "/category/:slug",
    component: <Category />,
  },
  {
    path: "/restaurants/:id",
    component: <Restaurant />,
  }
];

const commonRoutes = [
  { 
    path: "/confirm", 
    component: <ConfirmEmail /> 
  },
  { 
    path: "/edit-profile", 
    component: <EditProfile /> 
  }
];

const restaurantRoutes = [
  { 
    path: "/", 
    component: <MyRestaurants /> 
  },
  { 
    path: "/add-restaurant", 
    component: <AddRestaurant /> 
  }
];


export const LoggedInRouter = () => {
  const { data, loading, error } = useMe();
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="font-medium text-xl tracking-wide">loading...</span>
      </div>
    )
  }
  return (
    <Router>
      <Header />
      <Routes>
        {data.me.role === 'Client' && clientRoutes.map((route) => (
          <Route
          key={route.path}
          path={route.path}
          element={route.component}
        />
        ))}
        {data.me.role === 'Owner' && restaurantRoutes.map((route) => (
          <Route
          key={route.path}
          path={route.path}
          element={route.component}
        />
        ))}
        {commonRoutes.map((route) => (
          <Route
          key={route.path}
          path={route.path}
          element={route.component}
        />
        ))}
        <Route
          key='notFound'
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Router>
  )
}
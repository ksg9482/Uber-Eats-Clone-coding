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

const ClientRouters = [
  <Route
    key={1}
    path="/"
    element={<Restaurants />}
  />,
  <Route
    key={2}
    path="/confirm"
    element={<ConfirmEmail />}
  />,
  <Route
    key={3}
    path="/edit-profile"
    element={<EditProfile />}
  />,
  <Route
    key={4}
    path="/search"
    element={<Search />}
  />,
  <Route
    key={5}
    path="/category/:slug"
    element={<Category />}
  />,
  <Route
    key={6}
    path="/restaurants/:id"
    element={<Restaurant />}
  />
]


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
        {data.me.role === 'Client' && ClientRouters}
        <Route
          key='notFound'
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Router>
  )
}
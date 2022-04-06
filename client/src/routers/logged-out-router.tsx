import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isLoggedInVar } from "../apollo";
import { CreateAccount } from "../pages/create-account";
import { Login } from "../pages/login";

// interface IForm {
//     email: string;
//     password: string;
// }

export const LoggedOutRouter = () => {

    return (
        <Router>
            <Routes>
                <Route 
                path="/create-account" 
                element={<CreateAccount />} 
                />
                <Route 
                path="/" 
                element={<Login />} 
                /> 
            </Routes>
        </Router>
    )



    // const { register, watch, handleSubmit, formState: { errors } } = useForm<IForm>();

    // const onSubmit = () => {
    //     console.log(watch());
    // };
    // const onInvalid = () => {
    //     console.log("cant create account");
    // };

    // return (
    //     <div>
    //         <h1>logged out</h1>
    //         <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
    //             <div>
    //                 <input
    //                     {...register("email", {
    //                         required: 'This is required',
    //                         pattern: /^[A-Za-z0-9._%+-]+@gmail.com$/
    //                     })}
    //                     name="email"
    //                     type="email"
    //                     placeholder="email"
    //                 />
    //                 {errors.email?.message && (
    //                     <span className="font-bold text-red-600">
    //                         {errors.email?.message}
    //                     </span>
    //                 )}
    //                 {errors.email?.type === "pattern" && (
    //                     <span className="font-bold text-red-600">Only gmail allowed</span>
    //                 )}
    //             </div>
    //             <div>
    //                 <input
    //                     {...register("password", { required: true })}
    //                     name="password"
    //                     type="password"
    //                     required
    //                     placeholder="password"
    //                 />
    //             </div>
    //             <button className="bg-yellow-300 text-white">submit</button>
    //         </form>
    //     </div>
    // )
}
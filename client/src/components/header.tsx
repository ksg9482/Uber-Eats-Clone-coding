import React from "react"
import { Link } from "react-router-dom";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import yuberLogo from "../images/logo.svg"
import { useMe } from "../hooks/useMe";

export const Header: React.FC = () => {
    const { data } = useMe();
    return (
        <>
        {!data?.me.verified && (
            <div className="bg-red-500 p-3 text-center text-base text-white">
                <span>Please verify your email</span>
            </div>
        )}
    <header className="py-4">
        <div className="w-full px-5 xl:px-0 max-w-screen-2xl mx-auto flex justify-between items-center">
            <Link to='/'>
            <img className="w-44 " src={yuberLogo} alt="Yuber Eats" />
            </Link>
            <span className="text-xs">
                <Link to='/edit-profile'>
                <FontAwesomeIcon icon={faUser}  className="text-3xl"/>
                </Link>
            </span>
        </div>
    </header>
    </>
)}
import React from "react"
import { Link } from "react-router-dom";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import yuberLogo from "../images/logo.svg"
import { useMe } from "../hooks/useMe";

export const Header: React.FC = () => {
    const { data } = useMe();
    return (
    <header className="py-4">
        <div className="w-full px-5 xl:px-0 max-w-screen-xl mx-auto flex justify-between items-center">
            <img className="w-24 " src={yuberLogo} alt="Yuber Eats" />
            <span className="text-xs">
                <Link to='/my-profile'>
                <FontAwesomeIcon icon={faUser}  className="text-xl"/>
                </Link>
            </span>
        </div>
    </header>
)}
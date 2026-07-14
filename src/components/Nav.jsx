"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const links = [
    { href: "/", label: "Home" },
    { href: "/cart", label: "Cart" },
];

const Nav = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { totalCount } = useCart();

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
                    Shop<span className="text-indigo-600">.</span>
                </Link>

                <ul className="hidden items-center gap-8 sm:flex">
                    {links.map(({ href, label }) => {
                        const isActive = pathname === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                                        isActive ? "text-indigo-600" : "text-gray-600"
                                    }`}
                                >
                                    {label}
                                    {href === "/cart" && totalCount > 0 && (
                                        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
                                            {totalCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 sm:hidden"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        {open ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                        )}
                    </svg>
                </button>
            </div>

            {open && (
                <ul className="flex flex-col gap-1 border-t border-gray-200 px-4 pb-4 pt-2 sm:hidden">
                    {links.map(({ href, label }) => {
                        const isActive = pathname === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {label}
                                    {href === "/cart" && totalCount > 0 && (
                                        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
                                            {totalCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </nav>
    );
};
export default Nav;
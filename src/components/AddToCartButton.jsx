"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

const AddToCartButton = ({ product, className }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={
                className ??
                "rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            }
        >
            {added ? "Added ✓" : "Add to cart"}
        </button>
    );
};

export default AddToCartButton;
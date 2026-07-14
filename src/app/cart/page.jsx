"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const Cart = () => {
    const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
                <p className="text-lg font-medium text-gray-600">Your cart is empty.</p>
                <Link
                    href="/"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
                    Your Cart
                </h1>

                <ul className="flex flex-col gap-4">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="relative h-20 w-20 shrink-0 rounded-md bg-gray-100">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="80px"
                                    className="object-contain p-2"
                                />
                            </div>

                            <div className="flex flex-1 flex-col gap-1">
                                <span className="line-clamp-1 text-sm font-semibold text-gray-900">
                                    {item.title}
                                </span>
                                <span className="text-sm text-gray-500">
                                    ${item.price.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-7 w-7 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                                >
                                    −
                                </button>
                                <span className="w-6 text-center text-sm font-medium text-gray-900">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-7 w-7 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>

                            <span className="w-20 text-right text-sm font-semibold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>

                            <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                aria-label="Remove item"
                                className="text-gray-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                    <button
                        type="button"
                        onClick={clearCart}
                        className="text-sm font-medium text-gray-500 hover:text-red-600"
                    >
                        Clear cart
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-900">
                            Total: ${totalPrice.toFixed(2)}
                        </span>
                        <button
                            type="button"
                            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
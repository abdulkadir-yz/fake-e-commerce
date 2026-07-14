import Image from 'next/image';
import Link from "next/link";
import { fetchProducts } from '@/lib/api';
import AddToCartButton from '@/components/AddToCartButton';

const Page = async () => {
    const products = await fetchProducts()

    return (
        <div className="min-h-full bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
                    Products
                </h1>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products?.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="relative aspect-square w-full bg-gray-100">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                                    className="object-contain p-6 transition-transform group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-1 flex-col gap-2 p-4">
                                <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                                    {product.category}
                                </span>
                                <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
                                    {product.title}
                                </h2>
                                <p className="line-clamp-2 text-sm text-gray-500">
                                    {product.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-3">
                                    <span className="text-lg font-bold text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <AddToCartButton product={product} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
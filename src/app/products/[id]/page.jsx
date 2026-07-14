import Image from 'next/image';
import Link from 'next/link';
import { fetchProduct } from '@/lib/api';
import AddToCartButton from '@/components/AddToCartButton';

const ProductPage = async ({ params }) => {
    const { id } = await params;
    const product = await fetchProduct(id);

    return (
        <div className="min-h-full bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="mb-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    ← Back to products
                </Link>

                <div className="grid grid-cols-1 gap-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-10">
                    <div className="relative aspect-square w-full bg-gray-100 rounded-lg">
                        <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="(min-width: 640px) 50vw, 100vw"
                            className="object-contain p-8"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                            {product.category}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {product.title}
                        </h1>
                        {product.rating && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>⭐ {product.rating.rate}</span>
                                <span>({product.rating.count} reviews)</span>
                            </div>
                        )}
                        <p className="text-gray-600">{product.description}</p>

                        <div className="mt-auto flex items-center justify-between pt-4">
                            <span className="text-3xl font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                            </span>
                            <AddToCartButton
                                product={product}
                                className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
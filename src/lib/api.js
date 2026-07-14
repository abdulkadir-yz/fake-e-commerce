export const fetchProducts = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products')
        if (!response.ok) {
            throw new Error('Failed to fetch products')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching products:', error)
        throw error
    }
}

export const fetchProduct = async (id) => {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`)
        if (!response.ok) {
            throw new Error('Failed to fetch product')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching product:', error)
        throw error
    }
}
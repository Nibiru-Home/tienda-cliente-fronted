const reusedImageForProduct = (productId?: number, image?: string): string | undefined => {
    if (!image || !productId) {
        return image;
    }

    const match = image.match(/^(\d+)(\.\d+)?(\.[a-zA-Z0-9]+)$/);
    if (!match) {
        return image;
    }

    const variant = match[2] ?? '';
    const extension = match[3] ?? '';
    const baseId = ((productId - 1) % 15) + 1;

    return `${baseId}${variant}${extension}`;
};

export const buildProductImageVariants = (productId: number): string[] => {
    const baseId = ((productId - 1) % 15) + 1;
    return [`${baseId}.jpg`, `${baseId}.1.png`, `${baseId}.2.png`];
};

export const buildProductImageUrl = (
    productName: string | undefined,
    image: string | undefined,
    productId?: number,
    baseUrl = '/images/products'
): string => {
    if (!image) {
        return 'assets/images/error-404.svg';
    }

    if (image.startsWith('http') || image.startsWith('/') || image.startsWith('assets')) {
        return image;
    }

    const normalizedImage = reusedImageForProduct(productId, image) ?? image;
    const safeImage = encodeURIComponent(normalizedImage);
    const safeName = productName ? encodeURIComponent(productName) : '';

    if (!safeName) {
        return `${baseUrl}/${safeImage}`;
    }

    return `${baseUrl}/${safeName}/${safeImage}`;
};

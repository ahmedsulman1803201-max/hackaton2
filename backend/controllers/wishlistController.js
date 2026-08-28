import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";

const getOrCreateWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    return wishlist;
};

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await getOrCreateWishlist(req.user._id);
        await wishlist.populate("items.product");

        return res.status(200).json({
            success: true,
            wishlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
        });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product not found",
            });
        }

        const wishlist = await getOrCreateWishlist(req.user._id);
        const exists = wishlist.items.some((item) => item.product.toString() === productId);
        if (!exists) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }
        await wishlist.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const wishlist = await getOrCreateWishlist(req.user._id);
        wishlist.items = wishlist.items.filter((item) => item.product.toString() !== productId);

        await wishlist.save();
        await wishlist.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Item removed from wishlist",
            wishlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
        });
    }
};

export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await getOrCreateWishlist(req.user._id);
        wishlist.items = [];
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Wishlist cleared",
            wishlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
        });
    }
};

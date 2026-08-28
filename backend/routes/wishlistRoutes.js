import express from "express";
const wishlistRouter = express.Router();
import { isAuthenticatedUser } from "../utils/userAuth.js";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlistController.js";

wishlistRouter.get("/", isAuthenticatedUser, getWishlist);
wishlistRouter.post("/add", isAuthenticatedUser, addToWishlist);
wishlistRouter.delete("/remove/:productId", isAuthenticatedUser, removeFromWishlist);
wishlistRouter.delete("/clear", isAuthenticatedUser, clearWishlist);

export default wishlistRouter;

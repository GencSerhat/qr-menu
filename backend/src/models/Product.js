import mongoose from "mongoose";
import Category from "./Category";

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type:String,
            required:true,
            trim:true,
            minlength:2,
            maxlength:100,
        },
        price: {
            type:Number,
            required:true,
            min:0,
        },
        imageUrl: {
            type:String,
            default:"",
            trim:true,
            maxlength:500,
        },
        categoryId : {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Category",
            required:true,
            index:true,
        },
        order: {
            type:Number,
            default:0,
            min:0,
        },
        isActive: {
            type:Boolean,
            default:true,
        },
    },
    {timestamps:true}
);
// İsteğe bağlı: fiyatı tamsayı kuruşa dönüştürmek istersen ayrı bir alan ekleyebilirdik.
// Şimdilik basit bırakıyoruz; validation yeterli.

export default mongoose.model("Product",ProductSchema);

import mongoose from "mongoose";
// Basit ve bağımsız slug üretici (ekstra paket yok)
function toSlug(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")                 // aksanları ayır
    .replace(/[\u0300-\u036f]/g, "")  // aksanları sil
    .replace(/[^a-z0-9]+/g, "-")      // harf/rakam dışını tire yap
    .replace(/^-+|-+$/g, "")          // baş/son tireleri temizle
    .replace(/-{2,}/g, "-");          // çift tiri tekle
}

const CategorySchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true,
            minlength:2,
            maxlength:60,
        },
        slug: {
            type:String,
            required:true,
            trim:true,
            lowercase:true,
        },
        coverImageUrl: {
            type:String,
            default:"",
            trim:true,
        },
        order:{
            type:Number,
            default:0,
            min:0,
        },
        isActive:{
            type:Boolean,
            default:true,
        },

    },
    {timestamps:true}
);
//Title değiştiyse slug/ı otomatik üret
CategorySchema.pre("validate", function(next) {
    if(this.isModified("title")|| !this.slug){
        this.slug = toSlug(this.title);
    }
    next();
});

export default mongoose.model("Category", CategorySchema);


// Not: slug alanında unique index var. 
// Aynı başlıkla iki kategori yaratmaya çalışırsan Mongo duplicate key hatası verecek;
//  bunu route tarafında, kullanıcıya düzgün mesajla döndüreceğiz.
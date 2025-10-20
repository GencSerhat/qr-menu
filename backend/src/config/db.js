import mongoose from "mongoose";

export async function connectDB(uri) {
    try {
        if(!uri) throw new Error("MONGODB_URI eksik");
        //Opsiyonlar monggose 8 + için çoğu varsayılan; sade bıraktık
        await mongoose.connect(uri);
        console.log("MongoDB bağlantısı başarılı");
    } catch (err) {
        console.log("MongoDB bağlantı hatası :",err.message);
        process.exit(1);
    }
}

// (Opsiyonel) Süreç kapanışında bağlantıyı kapatmak istersen:
// export async function closeDB() { await mongoose.connection.close(); }
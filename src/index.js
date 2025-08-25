import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { dbName: "hospital" })
  .then(() => {
    console.log(" MONGODB connected !! DB HOST :");
    console.log(new URL(MONGO_URI).host);
    app.listen(PORT, () => {
      console.log("server is running at port :");
      console.log("      ", PORT);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err?.message);
    process.exit(1);
  });

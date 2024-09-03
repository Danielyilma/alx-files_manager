import express from "express";
import router from "./routes";

const PORT = process.env.PORT ?? 5000;

const app = new express();


app.use(express.json())
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { userRoute } from "./APIs/UserAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import cookieParser from "cookie-parser";
import { commonRouter } from "./APIs/CommanAPI.js";
config(); //process.env
const app = exp();
//add body parser
app.use(exp.json());
//add cookieparser middleware
app.use(cookieParser());

app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);
//connect to database
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connection sucess");
    //start http server
    app.listen(process.env.PORT, () => console.log("server started"));
  } catch (err) {
    console.log("  failed to connect db", err);
  }
};
connectDB();

//dealing with inavlaid path
app.use((req, res, next) => {
  res.json({ message: `${req.url} is invalid path` });
});

//error handling middleware
app.use((err, req, res, next) => {
  console.log("error : ", err);
  res.json({ mesaage: "error", reason: err.message });
});

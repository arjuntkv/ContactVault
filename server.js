const express = require("express");
const connectDB = require("./config/db");

const app = express();

//connect DB
connectDB();

//middleware instead of body-parser
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.json({
    msg: "Welcome",
  });
});

//Routes
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/contacts", require("./routes/contacts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on ${PORT}`));

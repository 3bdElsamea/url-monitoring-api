const mongoose = require("mongoose");

const app = require("./app");
const port = process.env.PORT || 3000;

mongoose.set("strictQuery", true);

// mongoose.set("runValidators", true);

// Connect to database
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Database connected successfully");
    // Start server
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

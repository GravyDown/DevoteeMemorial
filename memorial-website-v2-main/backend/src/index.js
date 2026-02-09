import { app } from "./app.js";
import connectDB from "./db/db.js";

connectDB()
  .then(() => {
    const PORT = process.env.PORT;
    if (!PORT) {
      throw new Error("PORT is not defined");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });

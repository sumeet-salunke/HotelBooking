import "./src/config/dns.js";
import dotenv from "dotenv";
dotenv.config();


import app from "./src/app.js";
import startBookingCron from "./src/cron/booking.cron.js";


import connectDB from "./src/config/db.js";
import logger from "./src/config/logger.js";



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    //start bbackground jobs only after DB is conected
    startBookingCron();
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    })
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

startServer();
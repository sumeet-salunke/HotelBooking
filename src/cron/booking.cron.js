import cron from "node-cron";

import bookingService
  from "../modules/booking/booking.service.js";
import logger from "../config/logger.js";

const startBookingCron = () => {

  /*
  Every 5 minutes
  */

  cron.schedule(

    "*/5 * * * *",

    async () => {

      try {

        const result =
          await bookingService
            .expirePendingBookings();

        logger.info(`Expired Bookings: ${result.modifiedCount}`);

      }

      catch (error) {

        logger.error(`Booking Cron Error: ${error.message}`);

      }

    }

  );

};

export default startBookingCron;

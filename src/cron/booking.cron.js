import cron from "node-cron";

import bookingService
  from "../modules/booking/booking.service.js";

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

        console.log(

          `Expired Bookings: ${result.modifiedCount}`

        );

      }

      catch (error) {

        console.error(

          "Booking Cron Error:",

          error.message

        );

      }

    }

  );

};

export default startBookingCron;
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Hotel Booking API",
      version: "1.0.0",
      description:
        "REST API for Hotel Booking System built with Node.js, Express.js and MongoDB."
    },

    tags: [
      {
        name: "Authentication",
        description: "User authentication APIs"
      },
      {
        name: "Hotels",
        description: "Hotel management"
      },
      {
        name: "Rooms",
        description: "Room management"
      },
      {
        name: "Bookings",
        description: "Booking management"
      },
      {
        name: "Admin",
        description: "Admin operations"
      }
    ],

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    "./src/modules/**/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export {
  swaggerUi,
  swaggerSpec
};

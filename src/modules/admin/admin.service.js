import mongoose from "mongoose";
import adminRepository from "./admin.repository.js";

import { HOTEL_STATUS } from "../../constants/hotelStatus.js";
import { ADMIN_MESSAGES } from "../../constants/messages.js";

class AdminService {
  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  async getPendingHotels(query) {
    let { page, limit, city, search, sort } = query;
    page = Number(page);
    limit = Number(limit);
    page = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    limit = Number.isFinite(limit) && limit >= 1 ?
      Math.min(Math.floor(limit), 50) : 10;

    const filter = {
      status: HOTEL_STATUS.PENDING,
      isDeleted: false,
      isActive: true
    };
    if (city) {
      filter["address.city"] = {
        $regex: this.escapeRegex(city.trim()),
        $options: "i"
      };
    }
    if (search) {
      const escaped = this.escapeRegex(search.trim());
      filter.$or = [{
        name: {
          $regex: escaped,
          $options: "i"
        }
      }, {
        description: {
          $regex: escaped,
          $options: "i"
        }
      }];
    }
    let sortOptions;
    switch (sort) {
      case "oldest":
        sortOptions = {
          createdAt: 1,
          _id: 1
        };
        break;
      case "newest":
      default:
        sortOptions = {
          createdAt: -1,
          _id: 1
        };
    }
    const skip = (page - 1) * limit;
    const { hotels, totalHotels } = await adminRepository.findPendingHotels({ filter, sort: sortOptions, skip, limit });
    return {
      message: ADMIN_MESSAGES.PENDING_HOTELS_FETCHED,
      data: {
        hotels,
        pagination: {
          page, limit, totalHotels, totalPages: Math.ceil(totalHotels / limit)
        }
      }
    }
  }

  async approveHotel(hotelId) {

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(
        400,
        ADMIN_MESSAGES.INVALID_HOTEL_ID
      );
    }

    // Approve only pending hotel
    const hotel = await adminRepository.approveHotel(hotelId);

    if (!hotel) {
      throw new ApiError(
        400,
        ADMIN_MESSAGES.HOTEL_CANNOT_APPROVE
      );
    }

    return {
      message: ADMIN_MESSAGES.HOTEL_APPROVED,
      data: {
        hotel
      }
    };
  }
  async rejectHotel(hotelId, reason) {

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(
        400,
        ADMIN_MESSAGES.INVALID_HOTEL_ID
      );
    }

    // Extra safety
    if (!reason?.trim()) {
      throw new ApiError(
        400,
        ADMIN_MESSAGES.REJECTION_REASON_REQUIRED
      );
    }

    const hotel = await adminRepository.rejectHotel(
      hotelId,
      reason.trim()
    );

    if (!hotel) {
      throw new ApiError(
        400,
        ADMIN_MESSAGES.HOTEL_CANNOT_REJECT
      );
    }

    return {
      message: ADMIN_MESSAGES.HOTEL_REJECTED,
      data: {
        hotel
      }
    };

  }

  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async getUsers(query) {

    let {
      page,
      limit,
      role,
      search,
      sort
    } = query;

    // Pagination
    page = Number(page);
    limit = Number(limit);

    page =
      Number.isFinite(page) && page >= 1
        ? Math.floor(page)
        : 1;

    limit =
      Number.isFinite(limit) && limit >= 1
        ? Math.min(Math.floor(limit), 50)
        : 10;

    // Filter
    const filter = {};

    if (role) {

      if (!Object.values(ROLES).includes(role)) {
        throw new ApiError(
          400,
          ADMIN_MESSAGES.INVALID_ROLE
        );
      }

      filter.role = role;

    }

    if (search) {

      const escaped =
        this.escapeRegex(search.trim());

      filter.$or = [

        {
          name: {
            $regex: escaped,
            $options: "i"
          }
        },

        {
          email: {
            $regex: escaped,
            $options: "i"
          }
        }

      ];

    }

    // Sorting

    let sortOptions;

    switch (sort) {

      case "oldest":

        sortOptions = {
          createdAt: 1,
          _id: 1
        };

        break;

      case "newest":

      default:

        sortOptions = {
          createdAt: -1,
          _id: 1
        };

        break;

    }

    const skip = (page - 1) * limit;

    const {
      users,
      totalUsers
    } = await adminRepository.findUsers({
      filter,
      sort: sortOptions,
      skip,
      limit
    });

    return {

      message: ADMIN_MESSAGES.USERS_FETCHED,

      data: {

        users,

        pagination: {

          page,

          limit,

          totalUsers,

          totalPages:
            Math.ceil(totalUsers / limit)

        }

      }

    };

  }
  async updateUserStatus(adminId, userId, isActive) {

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {

      throw new ApiError(
        400,
        ADMIN_MESSAGES.INVALID_USER_ID
      );

    }

    // Prevent self suspension
    if (adminId === userId) {

      throw new ApiError(
        400,
        ADMIN_MESSAGES.CANNOT_UPDATE_SELF
      );

    }

    const user =
      await adminRepository.updateUserStatus(
        userId,
        isActive
      );

    if (!user) {

      throw new ApiError(
        404,
        ADMIN_MESSAGES.USER_NOT_FOUND
      );

    }

    return {

      message:
        ADMIN_MESSAGES.USER_UPDATED,

      data: {

        user

      }

    };

  }

}

export default new AdminService();
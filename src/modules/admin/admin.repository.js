import Hotel from "../../models/Hotel.js";
import User from "../../models/User.js";
import { HOTEL_STATUS } from "../../constants/hotelStatus.js";


class AdminRepository {
  async findPendingHotels({
    filter, sort, skip, limit
  }) {
    const [hotels, totalHotels] = await Promise.all([
      Hotel.find(filter)
        .populate("ownerId", "name email")
        .sort(sort).skip(skip).limit(limit).lean(),
      Hotel.countDocuments(filter)
    ]);
    return {
      hotels, totalHotels
    };
  }
  async approveHotel(hotelId) {

    return await Hotel.findOneAndUpdate(

      {

        _id: hotelId,

        status: HOTEL_STATUS.PENDING,

        isDeleted: false

      },

      {

        $set: {

          status: HOTEL_STATUS.APPROVED,

          rejectionReason: null

        }

      },

      {

        returnDocument: "after",

        runValidators: true

      }

    )

      .populate("ownerId", "name email")

      .lean();

  }

  async rejectHotel(
    hotelId,
    reason
  ) {

    return await Hotel.findOneAndUpdate(

      {

        _id: hotelId,

        status: HOTEL_STATUS.PENDING,

        isDeleted: false

      },

      {

        $set: {

          status: HOTEL_STATUS.REJECTED,

          rejectionReason: reason

        }

      },

      {

        returnDocument: "after",

        runValidators: true

      }

    )

      .populate("ownerId", "name email")

      .lean();

  }
  async findUsers({ filter, sort, skip, limit }) {

    const [users, totalUsers] = await Promise.all([

      User.find(filter)
        .select("-password -refreshToken")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)

    ]);

    return {
      users,
      totalUsers
    };

  }
  async updateUserStatus(userId, isActive) {

    return await User.findOneAndUpdate(

      {
        _id: userId
      },

      {
        isActive
      },

      {
        returnDocument: "after",
        runValidators: true
      }

    )
      .select("-password -refreshToken -__v")
      .lean();

  }


}

export default new AdminRepository();

import { HOTEL_STATUS } from "../../constants/hotelStatus.js";
import { HOTEL_MESSAGES } from "../../constants/messages.js";
import Hotel from "../../models/Hotel.js";

class HotelRepository {
  async create(data) {
    return await Hotel.create(data);
  }

  async findById(hotelId) {
    return await Hotel.findOne({ _id: hotelId, isDeleted: false });
  }

  async findByOwner(ownerId) {
    return await Hotel.find({
      ownerId, isDeleted: false
    });
  }
  async findDuplicate(ownerId, name, city) {
    return await Hotel.findOne({
      ownerId, name, "address.city": city,
      isDeleted: false,
    });
  }
  async updateById(hotelId, data) {
    return await Hotel.findByIdAndUpdate(
      hotelId, data, {
      new: true, runValidators: true
    }
    );
  }

  async findPublicHotels({ filter, sort, skip, limit }) {
    //both queries are independent, run them concurrently
    const [hotels, totalHotels] = await Promise.all([
      Hotel.find(filter).sort(sort).limit(limit).lean(), Hotel.countDocuments(filter)
    ]);
    return {
      hotels, totalHotels,
    };

  }

  async findPublicById(hotelId) {
    return await Hotel.findOne({
      _id: hotelId,
      status: HOTEL_STATUS.APPROVED,
      isActive: true,
      isDeleted: false
    }).lean();
  }

  async findOwnerHotels({ filter, skip, limit }) {
    const [hotels, totalHotels] = await Promise.all([
      Hotel.find(filter)
        .sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).lean(), Hotel.countDocuments(filter)]);
    return {
      hotels, totalHotels
    };
  }

  async findOwnedHotelById(hotelId, ownerId) {
    return await Hotel.findOne({
      _id: hotelId,
      ownerId: ownerId,
      isDeleted: false
    });
  }

  async updateOwnedHotel(hotelId, ownerId, updateData) {
    return await Hotel.findOneAndUpdate(
      {
        _id: hotelId,
        ownerId: ownerId,
        isDeleted: false
      }, updateData, {
      new: true, runValidators: true
    }
    );
  }

  async softDeleteOwnedHotel(hotelId, ownerId) {
    return await Hotel.findOneAndUpdate(
      {
        _id: hotelId, ownerId, isDeleted: false
      },
      {
        isDeleted: true, isActive: false, deletedAt: new Date()
      }, {
      new: true
    }
    );
  }
}
export default new HotelRepository();

//lean() is used to tell Mongoose to return a plain Javascript object instaed of a full Mongoose document
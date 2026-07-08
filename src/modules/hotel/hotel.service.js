import ApiError from "../../utils/ApiError.js";
import hotelRepository from "./hotel.repository.js";
import mongoose from "mongoose";
import { HOTEL_MESSAGES } from "../../constants/messages.js";
import { HOTEL_STATUS } from "../../constants/hotelStatus.js";
// skip = (page - 1) * limit
class HotelService {
  async createHotel(ownerId, hotelData) {
    const { name, address } = hotelData;
    //duplicate check
    const existingHotel = await hotelRepository.findDuplicate(ownerId, name, address.city);

    if (existingHotel) {
      throw new ApiError(409, HOTEL_MESSAGES.DUPLICATE);
    }
    //create hotel
    const hotel = await hotelRepository.create({ ...hotelData, ownerId });
    return {
      message: HOTEL_MESSAGES.CREATED,
      data: {
        hotel
      }
    };

  }

  async getHotels(query) {
    //extract query parameters
    let {
      page,
      limit,
      city,
      search,
      sort,
    } = query;

    //convert to numbers
    page = Number(page);
    limit = Number(limit);

    //safe pagination values
    page = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    limit = Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), 50) : 10;

    //base public filter
    const filter = {
      status: HOTEL_STATUS.APPROVED,
      isActive: true,
      isDeleted: false,
    };
    //filter by city
    if (city) {
      const escapedCity = this.escapedRegex(String(city).trim());
      filter["address.city"] = { $regex: escapedCity, $options: "i" };
    }
    //search by name or description
    if (search) {
      const escapedSearch = this.escapedRegex(String(search).trim());
      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i"
          }
        }, {
          description: {
            $regex: escapedSearch, $options: "i"
          }
        }
      ];
    }
    //sorting
    let sortOptions;
    switch (sort) {
      case "rating_desc":
        sortOptions = {
          averageRating: -1,
          _id: 1
        };
        break;

      case "rating_desc":
        sortOptions = {
          averageRating: 1,
          _id: 1
        };
        break;
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
    const { hotels, totalHotels } = await hotelRepository.findPublicHotels({
      filter, sort: sortOptions, skip, limit
    });
    //calculate total pages
    const totalPages = Math.ceil(totalHotels / limit);
    return {
      message: HOTEL_MESSAGES.FETCHED,
      data: {
        hotels,
        pagination: {
          page, limit, totalHotels, totalPages
        }
      }
    };
  }

  async getHotelById(hotelId) {
    //validate objectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, HOTEL_MESSAGES.INVALID_ID);
    }
    const hotel = await hotelRepository.findPublicById(hotelId);
    if (!hotel) {
      throw new ApiError(404, HOTEL_MESSAGES.NOT_FOUND);

    }
    return {
      message: HOTEL_MESSAGES.FETCHED_ONE,
      data: { hotel }
    };

  }

  async getMyHotels(ownerId, query) {
    let { page, limit, status } = query;
    //safetly convert page and limit
    page = Number(page);
    limit = Number(limit);
    page = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    limit = Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), 50) : 10;

    //base filter
    const filter = {
      ownerId,
      isDeleted: false
    }
    //optional filter status
    if (status) {
      if (!Object.values(HOTEL_STATUS).includes(status)) {
        throw new ApiError(400, HOTEL_MESSAGES.INVALID_STATUS);
      }
      filter.status = status;
    }
    //pagination offset
    const skip = (page - 1) * limit;
    //repository
    const { hotels, totalHotels } = await hotelRepository.findOwnerHotels({ filter, skip, limit });
    //pagination metadata
    const totalPages = Math.ceil(totalHotels / limit);
    return {
      message: HOTEL_MESSAGES.OWNER_HOTELS_FETCHED,
      data: {
        hotels,
        pagination: {
          page, limit, totalHotels, totalPages
        }
      }
    };

  }

  async updateHotel(ownerId, hotelId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, HOTEL_MESSAGES.INVALID_ID);
    }
    const hotel = await hotelRepository.findOwnedHotelById(hotelId, ownerId);
    if (!hotel) {
      throw new ApiError(404, HOTEL_MESSAGES.NOT_FOUND);
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError(400, HOTEL_MESSAGES.EMPTY);
    }

    const safeUpdate = { ...updateData };
    if (updateData.address) {
      safeUpdate.address = {
        ...hotel.address.toObject(), ...updateData.address
      };
    }
    //detect material changes
    const materialFields = [
      "name", "description", "address", "images"
    ];
    const hasMaterialChange = materialFields.some((field) =>
      Object.prototype.hasOwnProperty.call(updateData, field));
    //re-approval rule
    if (
      hotel.status === HOTEL_MESSAGES.APPROVED && hasMaterialChange
    ) {
      safeUpdate.status = HOTEL_MESSAGES.PENDING;
      safeUpdate.rejectionReason = null;
    }
    //update hotel
    const updatedHotel = await hotelRepository.updateOwnedHotel(hotelId, ownerId, safeUpdate);
    return {
      message: HOTEL_MESSAGES.UPDATED,
      data: {
        hotel: updatedHotel
      }
    };
  }

  async deleteHotel(ownerId, hotelId) {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, HOTEL_MESSAGES.INVALID_ID);
    }
    const hotel = await hotelRepository.findOwnedHotelById(hotelId, ownerId);
    if (!hotel) {
      throw new ApiError(404, HOTEL_MESSAGES.NOT_FOUND);
    }
    const deletedHotel = await hotelRepository.softDeleteOwnedHotel(hotelId, ownerId);
    if (!deletedHotel) {
      throw new ApiError(404, HOTEL_MESSAGES.NOT_FOUND);
    }
    return {
      message: HOTEL_MESSAGES.DELETED,
      data: null,
    }
  }



  escapedRegex(value) {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
  }
}

export default new HotelService();
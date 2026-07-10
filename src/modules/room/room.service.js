import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import hotelRepository from "../hotel/hotel.repository.js";
import roomRepository from "./room.repository.js";
import { ROOM_MESSAGES } from "../../constants/messages.js";
import { ROOM_TYPE } from "../../constants/roomType.js";

class RoomService {
  async createRoom(ownerId, roomData) {
    //extract required data
    const { hotelId, name,
      description,
      roomType,
      pricePerNight,
      maxGuests,
      totalRooms,
      bedType, amenities = [],
      images = []
    } = roomData;
    //vaidate hotel ID
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_HOTEL_ID);
    }
    //verify hotel ownership
    const hotel = await hotelRepository.findOwnedHotelById(hotelId, ownerId);

    if (!hotel) {
      throw new ApiError(404, ROOM_MESSAGES.HOTEL_NOT_FOUND);
    }
    //check hotel state
    if (!hotel.isActive) {
      //decide whether creation allowed
      throw new ApiError(409, ROOM_MESSAGES.HOTEL_INACTIVE);
    }
    //check duplicate room
    const duplicateRoom = await roomRepository.findDuplicate(hotelId, name);
    if (duplicateRoom) {
      throw new ApiError(409, ROOM_MESSAGES.DUPLICATE);
    }
    //construct safe payload
    const roomPayload = {
      hotelId,
      name,
      description,
      roomType,
      pricePerNight,
      maxGuests,
      totalRooms,
      bedType,
      amenities,
      images
    };

    //create room
    const room = await roomRepository.createRoom(roomPayload);
    return {
      message: ROOM_MESSAGES.CREATED,
      data: { room }
    };
  }

  async getPublicRooms(hotelId, query) {
    //validate hotel ID
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_HOTEL_ID);
    }
    //verify hotel is publicly visible
    const hotel = await hotelRepository.findPublicById(hotelId);
    if (!hotel) {
      throw new ApiError(404, ROOM_MESSAGES.HOTEL_NOT_FOUND);
    }
    //extract query parameters
    let {
      page, limit, roomType, minPrice, maxPrice, guests, sort
    } = query;
    //normalize pagination
    page = Number(page);
    limit = Number(limit);

    page = Number.isFinite(page) && page >= 1 ? Math.floor(page)
      : 1;
    limit = Number.isFinite(limit) && limit >= 1 ? Math.min(
      Math.floor(limit), 50
    ) : 10;
    //base room filter
    const filter = { hotelId, isActive: true, isDeleted: false };
    //optional room type filter
    if (roomType) {
      if (!Object.values(ROOM_TYPE).includes(roomType)) {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_ROOM_TYPE);
      }
      filter.roomType = roomType;
    }
    //optional minimum price
    let parsedMinPrice;
    if (minPrice !== undefined) {
      parsedMinPrice = Number(minPrice);
      if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_PRICE);
      }
      //create price object only when needed.
      filter.pricePerNight = {
        ...(filter.pricePerNight || {}),
        $gte: parsedMinPrice
      };
    }
    //optionl maximun price
    let parsedMaxPrice;
    if (maxPrice !== undefined) {
      parsedMaxPrice = Number(maxPrice);
      if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_PRICE);
      }
      filter.pricePerNight = {
        ...(filter.pricePerNight || {}),
        $lte: parsedMaxPrice
      };
    }
    //validate price range
    if (parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice >= parsedMaxPrice
    ) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_PRICE_RANGE);
    }
    //optional guest capacity filter
    if (guests !== undefined) {
      const parsedGuests = Number(guests);
      if (!Number.isFinite(parsedGuests) || !Number.isInteger(parsedGuests)) {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_GUESTS);
      }
      filter.maxGuests = {
        $gte: parsedGuests
      }
    }
    //build sort options
    let sortOptions;
    switch (sort) {
      case "price_asc":
        sortOptions = {
          pricePerNight: 1, _id: 1
        };
        break;
      case "price_desc":
        sortOptions = {
          pricePerNight: -1, _id: -1
        }; break;
      case "capacity_desc":
        sortOptions = {
          maxGuests: -1, _id: -1
        }; break;
      case "newest":
      default: sortOptions = {
        createdAt: -1, _id: -1
      };
        break;
    }
    //calculate pagination offset
    const skip = (page - 1) * limit;
    //query repo
    const { rooms, totalRoomTypes } = await roomRepository.findPublicRooms({ filter, sort: sortOptions, skip, limit });

    const totalPages = Math.ceil(totalRoomTypes / limit);
    //return service result
    return {
      message: ROOM_MESSAGES.FETCHED,
      data: {
        rooms,
        pagination: {
          page, limit, totalRoomTypes, totalPages
        }
      }
    };
  }

  async getOwnerRooms(ownerId, hotelId, query) {
    //validate hotelId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_HOTEL_ID);
    }
    //verify ownership
    const hotel = await hotelRepository.findOwnedHotelById(hotelId, ownerId);
    if (!hotel) {
      throw new ApiError(404, ROOM_MESSAGES.HOTEL_NOT_FOUND);
    }
    //extract query parameters
    let { page, limit, roomType, isActive } = query;
    //normalize page and limit(pagination)
    page = Number(page);
    limit = Number(limit);
    page = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    limit = Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), 50) : 10;
    //create base filter
    const filter = {
      hotelId,
      isDeleted: false
    }
    if (roomType) {
      if (!Object.values(ROOM_TYPE).includes(roomType)) {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_ROOM_TYPE);
      }
      filter.roomType = roomType;
    }
    //boolean parsing
    if (isActive !== undefined) {
      if (isActive === "true") {
        filter.isActive = true;
      } else if (isActive === "false") {
        filter.isActive = false;
      } else {
        throw new ApiError(400, ROOM_MESSAGES.INVALID_ACTIVE_STATUS);
      }
    }

    //pagination offset
    const skip = (page - 1) * limit;
    //repository query
    const { rooms, totalRoomTypes } = await roomRepository.findOwnerRooms({ filter, skip, limit });
    const totalPages = Math.ceil(totalRoomTypes / limit);
    return {
      message: ROOM_MESSAGES.FETCHED,
      data: {
        rooms,
        pagination: {
          page,
          limit,
          totalRoomTypes,
          totalPages
        }
      }
    };

  }

  async updateRoom(ownerId, roomId, updateData) {
    //validate roomId object
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_ROOM_ID);
    }
    //reject empty update object
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError(400, ROOM_MESSAGES.EMPTY_OBJECT_DATA);
    }
    //find room
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new ApiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    //verify hotel ownership, 
    //Room->Hotel->Owner
    const hotel = await hotelRepository.findOwnedHotelById(room.hotelId, ownerId);
    if (!hotel) {
      throw new APiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    //duplicate name check, exculding current room
    if (updateData.name !== undefined) {
      const duplicateRoom =
        await roomRepository.findDuplicateExcludingRoom(
          room.hotelId,
          updateData.name,
          roomId
        );

      if (duplicateRoom) {
        throw new ApiError(
          409,
          ROOM_MESSAGES.DUPLICATE
        );
      }
    }
    //construct safe update
    const allowedFields = [
      "name",
      "description",
      "roomType",
      "pricePerNight",
      "maxGuests",
      "totalRooms",
      "bedType",
      "amenities",
      "images",
      "isActive"
    ];

    const safeUpdate = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        safeUpdate[field] = updateData[field];
      }
    }
    //update
    const updatedRoom = await roomRepository.updateById(roomId, safeUpdate);
    if (!updatedRoom) {
      throw new ApiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    return {
      message: ROOM_MESSAGES.UPDATED,
      data: updatedRoom
    }
  }

  async deleteRoom(ownerId, roomId) {
    //validate roomId ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(400, ROOM_MESSAGES.INVALID_ROOM_ID);
    }
    //find room
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new ApiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    //find hotel
    const hotel = await hotelRepository.findOwnedHotelById(room.hotelId, ownerId);
    if (!hotel) {
      throw new ApiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    const deletedRoom = await roomRepository.softDeleteById(roomId);
    if (!deletedRoom) {
      throw new ApiError(404, ROOM_MESSAGES.ROOM_NOT_FOUND);
    }
    //return 
    return {
      message: ROOM_MESSAGES.DELETED,
      data: null
    };
  }

}
export default new RoomService();
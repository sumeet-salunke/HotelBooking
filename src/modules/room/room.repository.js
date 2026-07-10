import Room from "../../models/Room.js";

class RoomRepository {

  async createRoom(data) {
    return await Room.create(data);
  }

  async findDuplicate(hotelId, name) {
    const escapedName = name.replace(
      /[.*+?^${}()|[\]\\]/g, "\\$&"
    );
    return await Room.findOne({
      hotelId,
      name: {
        $regex: `^${escapedName}`, $options: "i"
      },
      isDeleted: false
    });
  }
  async findPublicRooms({ filter, sort, skip, limit }) {
    const [rooms, totalRoomTypes] = await Promise.all([Room.find(filter).sort(sort).skip(skip).limit(limit).lean(), Room.countDocuments(filter)]);
    return {
      rooms, totalRoomTypes
    };
  }
  async findOwnerRooms({ filter, skip, limit }) {
    const [rooms, totalRoomTypes] = await Promise.all([Room.find(filter).sort({
      createdAt: -1, _id: 1
    }).skip(skip).limit(limit).lean(), Room.countDocuments(filter)]);
    return {
      rooms, totalRoomTypes
    }
  }

  async findById(roomId) {
    return await Room.findOne({
      _id: roomId, isDeleted: false
    });
  }
  async updateById(roomId, upadateData) {
    return await Room.findOneAndUpdate({
      _id: roomId, isDeleted: false
    }, upadateData, {
      new: true, runValidators: true
    });
  }

  async findDuplicateExcludingRoom(
    hotelId,
    name,
    roomId
  ) {
    const escapedName = name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    return await Room.findOne({
      _id: {
        $ne: roomId
      },

      hotelId,

      name: {
        $regex: `^${escapedName}$`,
        $options: "i"
      },

      isDeleted: false
    });
  }
  async softDeleteById(roomId) {
    return await Room.findOneAndUpdate({
      _id: roomId,
      isDeleted: false
    }, {
      isDeleted: true,
      isActive: false,
      deletedAt: new Date()
    }, {
      new: true
    });
  }
}

export default new RoomRepository();
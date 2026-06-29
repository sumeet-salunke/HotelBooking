import User from "../models/User.js";

class UserRepository {

  async create(userData, session = null) {

    const [user] = await User.create(
      [userData],
      { session }
    );

    return user;
  }
  async deleteById(userId) {

    return await User.findByIdAndDelete(userId);

  }

  async findByEmail(email) {

    return await User.findOne({
      email
    });

  }

  async findById(userId) {

    return await User.findById(userId);

  }

  async update(userId, data) {

    return await User.findByIdAndUpdate(

      userId,

      data,

      {
        new: true
      }

    );

  }

}

export default new UserRepository();
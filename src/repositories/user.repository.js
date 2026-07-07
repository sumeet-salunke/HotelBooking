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
    }).select("+password");

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
  async verifyUser(userId) {
    return await User.findByIdAndUpdate(userId, { isVerified: true },
      { new: true }
    );
  }

  async updateById(userId, updateData) {
    console.log("Updating user: ", userId, updateData);
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }
  async save(user) {
    return await user.save();
  }

}

export default new UserRepository();
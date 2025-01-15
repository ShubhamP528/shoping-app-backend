const Address = require("../model/address");
const User = require("../model/user");

const getAllAddress = async (req, res) => {
  try {
    const user = req.user;
    const userAddress = await User.findById(user.id).populate("address");
    res.json(userAddress.address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = req.user;
    const address = req.body;
    const newAddress = await Address.create(address);
    user.address.push(newAddress._id);
    await user.save();
    res.json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = req.body;
    const updatedAddress = await Address.findByIdAndUpdate(id, address, {
      new: true,
    });
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllAddress, addAddress, editAddress };

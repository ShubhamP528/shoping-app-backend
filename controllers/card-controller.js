const Address = require("../model/card");
const User = require("../model/user");

const getAllCard = async (req, res) => {
  try {
    const user = req.user;
    const userCard = await User.findById(user.id).populate("card");
    res.json(userCard.card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCard = async (req, res) => {
  try {
    const user = req.user;
    const card = req.body;
    const newCard = await Address.create(card);
    user.card.push(newCard._id);
    await user.save();
    res.json(newCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = req.body;
    const updatedCard = await Address.findByIdAndUpdate(id, card, {
      new: true,
    });
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllCard, addCard, editCard };

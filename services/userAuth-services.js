const User = require("../model/user");

exports.signupCustomer = async (name, email, password, userType) => {
  const newCustomer = new User({ name, email, password, role: userType });
  await newCustomer.save();
  return newCustomer;
};

exports.signupSeller = async (
  name,
  email,
  password,
  userType,
  storeName,
  businessAddress,
  contactNumber,
  businessCategory
) => {
  console.log(
    name,
    email,
    password,
    userType,
    storeName,
    businessAddress,
    contactNumber,
    businessCategory
  );
  const newUser = new User({
    name,
    email,
    password,
    role: userType,
    storeName,
    businessAddress,
    contactNumber,
    businessCategory,
  });
  await newUser.save();
  return newUser;
};

exports.getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

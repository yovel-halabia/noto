require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema({
	img: String,
	fullName: {type: String, required: [true, "this filed is required"]},
	email: {
		type: String,
		unique: [true, "user already exist"],
		validate: {
			validator: function (v) {
				return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
			},
			message: (props) => `${props.value} is not a valid email`,
		},
		required: [true, "this filed is required"],
	},
	password: {
		type: String,
		required: [true, "this filed is required"],
		minLength: [8, "password must contain at least 8 characters"],
	},
	address: Array,
	cards: Array,
	cartItems: Array,
	wishlistItems: Array,
	lastItems: Array,
});
userSchema.plugin(encrypt, {secret: process.env.PASSWORD_SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

const balckList = new mongoose.Schema({
	list: Array,
});
const BlackList = mongoose.model("BlackList", balckList);
module.exports = {
	User: User,
	BlackList: BlackList,
};

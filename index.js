require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const {User, BlackList} = require("./schemas");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");

//connect to DB
mongoose.connect(process.env.MONGODB_ACCESS_LINK, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
//add token to blacklist
app.post("/api/logout", (req, res) => {
	BlackList.findOneAndUpdate(
		{},
		{$push: {list: req.body.token.split(" ")[1]}},
		{
			upsert: true,
		},
		(err) => {
			err ? res.sendStatus(500) : res.sendStatus(200);
		},
	);
});

//get new use fields add to DB and return token to client
app.post("/api/signup", createNewUser, sendToken);

//get user fields check if user exists than return token to client
app.post("/api/login", authenticateUser, sendToken);

//authenticate token return 200 if ok 401 / 403 if not
app.get("/api/check-token", authenticateToken, (req, res) => res.sendStatus(200));

//get data
app.get("/api/user", authenticateToken, (req, res) => {
	User.findOne({_id: req.user.userId}, (err, user) => {
		if (err) return res.sendStatus(401);
		res.json({
			img: user.img,
			fullName: user.fullName,
			email: user.email,
			address: user.address,
			cards: user.cards,
			cartItems: user.cartItem,
			wishlistItems: user.wishlistItems,
			lastItems: user.lastItems,
		});
	});
});

//create new user
function createNewUser(req, res, next) {
	const user = new User({
		img: "",
		fullName: req.body.fullName,
		email: req.body.email,
		password: req.body.password,
		address: [],
		cards: [],
		cardItems: [],
		wishlistItems: [],
		LastItems: [],
	});
	if (user.validateSync()) return res.status(401).json({inputsError: user.validateSync().errors});
	else {
		user.save((err, user) => {
			if (err) {
				if (err.code == 11000) return res.status(401).json({generalError: "user already exists"});
				return res.sendStatus(401);
			}
			req.userId = user._id;
			next();
		});
	}
}

//send token
function sendToken(req, res) {
	const user = {userId: req.userId};
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"});
	res.json({accessToken: accessToken});
}

//middleware check if user exist than move userId to create token
function authenticateUser(req, res, next) {
	const authUser = {email: req.body.email, password: req.body.password};
	User.findOne({email: authUser.email}, (err, doc) => {
		if (err || !doc)
			return res.status(401).json({generalError: "one or two of your inputs icorrect"});
		if (doc.password !== authUser.password)
			return res.status(401).json({generalError: "one or two of your inputs icorrect"});
		req.userId = doc._id;
		next();
	});
}

//middleware check if token is valid than parse userId
function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401);
	BlackList.findOne((err, doc) => {
		if (err) return res.sendStatus(401);
		if (doc?.list.includes(token)) return res.sendStatus(403);
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) return res.sendStatus(403);
			req.user = user;
			next();
		});
	});
}

//checkups
mongoose.connection.on("connected", () => {
	console.log("DB is conected");
});
app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

const express = require("express");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const jwt = require("jsonwebtoken");

const posts = [
	{
		username: "yovel",
		title: "1",
	},
	{
		username: "bar",
		title: "12",
	},
];

app.get("/api", (req, res) => {
	res.json(posts);
});

app.post("/api/login", (req, res) => {
	const username = req.body.username;
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { check, validationResult } = require("express-validator");
const session = require("express-session");
const expressHbs = require("express-handlebars");

const SESSION__TIMEOUT = 1000 * 60 * 60 * 2;
const {
	port = 5000,
	NODE__ENV = "development",
	SESSION__NAME = "sid",
	SESSION__SECRET = "Hi , register",
	SESSION__TIME = SESSION__TIMEOUT,
} = process.env;
const IN__PROD = NODE__ENV === "production";
const users = [
	{ id: "1", name: "paul", email: "paul@gmail.com", password: "Mwag9836" },
	{ id: "2", name: "paul", email: "paul@gmail.com", password: "Mwag9836" },
	{ id: "3", name: "paul", email: "paul@gmail.com", password: "Mwag9836" },
];

app.use(
	session({
		name: SESSION__NAME,
		resave: false,
		saveUninitialized: false,
		secret: SESSION__SECRET,
		cookie: {
			maxAge: SESSION__TIME,
			sameSite: true,
			secure: IN__PROD,
		},
	})
);

//load static files
app.use(express.static(__dirname + "/public"));
//set the templating system
app.engine(
	"handlebars",
	expressHbs({
		extname: "handlebars",
		defaultLayout: "main-layout",
		layoutsDir: "views/layouts/",
	})
);
app.set("view engine", "handlebars");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//redirects to login if your not authenticated
const redirectToLogin = (req, res, next) => {
	if (!req.session.userId) {
		res.redirect("/login");
	} else {
		next();
	}
};
//redirects to dashboard if your are authenticated
const redirectTodashboard = (req, res, next) => {
	if (req.session.userId) {
		res.redirect("/dashboard");
	} else {
		next();
	}
};
//checks before
app.use((req, res, next) => {
	const { userId } = req.session;
	if (userId) {
		res.locals.user = users.find((user) => user.id === userId);
	}
	next();
});
//routes
app.get("/", (req, res) => {
	const { userId } = req.session;
	//check whether there is auser already in the current session
	res.render("home");
	//`${userId ? `<a href="/home">Home</a>` : `<a href="/home">Home</a>`}`);
});
app.get("/dashboard", redirectToLogin, (req, res) => {
	const user = users.find((user) => user.id === req.session.userId);
	res.render("dashboard");
});
app.get("/register", redirectTodashboard, (req, res) => {
	res.render("register");
});
app.get("/login", redirectTodashboard, (req, res) => {
	res.render("login");
	//req.session.userId
});
//validate login details
const validateLogin = [
	check("email", "Email cannot be null")
		.isEmail()
		.optional({ nullable: true, checkFalsy: true })
		.normalizeEmail(),
	check("password", "password cannot be null").optional({
		nullable: true,
		checkFalsy: true,
	}),
];
app.post("/register", (req, res) => {
	const { username, firstname, lastname, phonenumber, email, password } =
		req.body;
	if (username && firstname && lastname && phonenumber && email && password) {
		const exists = users.some(
			(user) => user.username === username,
			user.password === password,
			user.email === email,
			user.firstname === firstname,
			user.lastname === lastname,
			user.phonenumber === phonenumber
		);
		if (!exists) {
			const user = {
				id: users.length + 1,
				username,
				firstname,
				lastname,
				email,
				phonenumber,
				password,
			};
			users.push(user);
			req.session.userId = user.id;
			return res.redirect("/dashboard");
		}
	}
	res.redirect("/register");
});
app.post("/login", validateLogin, (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	if (email && password) {
		const user = users.find(
			(user) => user.email === email && user.password //if they match
		);
		if (user) {
			req.session.userId = user.id;
			return res.redirect("/dashboard");
		}
	}
	res.redirect("/login");
});
app.post("/logout", redirectToLogin, (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.redirect("/");
		}
		res.clearCookie(SESSION__NAME);
		res.redirect("/login");
	});
});

//listen to port
app.listen(port, () => console.info(`App running on port ${port}`));

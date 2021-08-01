const express = require("express");
const expressHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 5000;
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
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//routes
app.get("/", (req, res) => {
	res.render("register");
});
app.get("/login", (req, res) => {
	res.render("login");
});
app.post(
	"/register",
	urlencodedParser,
	[
		body("username")
			.trim()
			.exists({ checkFalsy: true })
			.isLength({ min: 8 })
			.matches("[0-9]"),
		body("firstname")
			.trim()
			.exists({ checkFalsy: true })
			.matches("[A-Z]")
			.isLength({ min: 8 }),
		body("lastname")
			.trim()
			.exists({ checkFalsy: true })
			.matches("[A-Z]")
			.isLength({ min: 8 }),
		body("phonenumber").exists({ checkFalsy: true }).isLength({ min: 8 }),
		body("email")
			.trim()
			.exists({ checkFalsy: true })
			.isLength({ min: 5 })
			.isEmail()
			.normalizeEmail(),
		body("password").isLength({ min: 8 }).matches("[0-9]").matches("[A-Z]"),
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const alert = errors.array();
			res.render("register", {
				alert,
			});
		}
	}
);
app.post("/login", (req, res) => {});

//listen to port
app.listen(port, () => console.info(`App running on port ${port}`));

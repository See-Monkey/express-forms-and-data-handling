const { body, validationResult, matchedData } = require("express-validator");
const usersStorage = require("../storages/usersStorage");

const minAge = 18;
const maxAge = 120;
const maxBio = 200;

const nameAlphaErr = "must only contain letters.";
const nameLengthErr = "must be between 1 and 10 characters.";
const emailError = "Email must be a valid email address";
const ageError = `Age must be a number between ${minAge} and ${maxAge}`;
const bioError = `Bio cannot be more than ${maxBio} characters`;

const validateUser = [
	body("firstName")
		.trim()
		.isAlpha()
		.withMessage(`First name ${nameAlphaErr}`)
		.isLength({ min: 1, max: 10 })
		.withMessage(`First name ${nameLengthErr}`),

	body("lastName")
		.trim()
		.isAlpha()
		.withMessage(`Last name ${nameAlphaErr}`)
		.isLength({ min: 1, max: 10 })
		.withMessage(`Last name ${nameLengthErr}`),

	body("email").trim().isEmail().withMessage(emailError),

	body("age")
		.optional({ value: "falsy" })
		.isInt({ min: minAge, max: maxAge })
		.withMessage(ageError)
		.toInt(),

	body("bio").optional().trim().isLength({ max: maxBio }).withMessage(bioError),
];

exports.usersListGet = (req, res) => {
	res.render("index", {
		title: "User list",
		users: usersStorage.getUsers(),
	});
};

exports.usersCreateGet = (req, res) => {
	res.render("createUser", {
		title: "Create user",
	});
};

// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
	validateUser,
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("createUser", {
				title: "Create user",
				errors: errors.array(),
			});
		}
		const { firstName, lastName, email, age, bio } = matchedData(req);
		usersStorage.addUser({ firstName, lastName, email, age, bio });
		res.redirect("/");
	},
];

exports.usersUpdateGet = (req, res) => {
	const user = usersStorage.getUser(req.params.id);
	res.render("updateUser", {
		title: "Update user",
		user: user,
	});
};

exports.usersUpdatePost = [
	validateUser,
	(req, res) => {
		const user = usersStorage.getUser(req.params.id);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("updateUser", {
				title: "Update user",
				user: user,
				errors: errors.array(),
			});
		}
		const { firstName, lastName, email, age, bio } = matchedData(req);
		usersStorage.updateUser(req.params.id, {
			firstName,
			lastName,
			email,
			age,
			bio,
		});
		res.redirect("/");
	},
];

exports.usersDeletePost = (req, res) => {
	usersStorage.deleteUser(req.params.id);
	res.redirect("/");
};

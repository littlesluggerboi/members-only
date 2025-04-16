import { body } from "express-validator";

const clubValidator = [
  body("name").isString().trim().isLength({ min: 1 }),
  body("description").optional().isString().trim(),
  body("approval")
    .optional()
    .isString()
    .custom((val) => {
      return val == "on";
    }),
  body("question").optional().isString().trim(),
  body("answer").optional().isString().trim(),
];

export default clubValidator;

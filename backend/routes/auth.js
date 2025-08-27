import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db.js";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Passed here - 01");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Invalid request: name, email or password is missing",
      });
    }

    console.log(email);
    console.log(password);
    console.log(name);

    console.log("Passed here - 02");

    // find exiting user
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    console.log(existingUser);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // then here hashed the password and save it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // then create the user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      message: "User created successfully",
      user: {
        id : newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Invalid request: email or password is missing",
      });
    }

    // check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    // check if password matches
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
})

export default userRouter;
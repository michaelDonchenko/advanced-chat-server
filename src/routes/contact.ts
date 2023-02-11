import express from "express";
import {PrismaClient} from "@prisma/client";
import {verifyToken} from "../middlewares/verifyToken";
import ContactController from "../controllers/contact";

const router = express.Router();
const prisma = new PrismaClient();
const contactController = new ContactController(prisma);
const baseUrl = "/contact";

router.get(`${baseUrl}`, verifyToken(), (req, res) => contactController.getContacts(req, res));
router.post(`${baseUrl}`, verifyToken(), (req, res) => contactController.createContact(req, res));

export default router;

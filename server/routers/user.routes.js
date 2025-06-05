import express from 'express'
import { login,getPeerId, getContacts } from '../controllers/user.controller.js';

const router = express.Router();

router.route('/user/login')
	.post(login);

router.route('/user/peerId')
	.get(getPeerId);

router.route('/user/contacts')
	.get(getContacts);

export default router
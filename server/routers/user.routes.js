import express from 'express'
import { login,getPeerId, getContacts,logout,setNotificationRegistrationToken,requestUserConnection } from '../controllers/user.controller.js';

const router = express.Router();

router.route('/user/login')
	.post(login);

router.route('/user/logout')
	.post(logout);

router.route('/user/peerId')
	.get(getPeerId);

router.route('/user/contacts')
	.get(getContacts);

router.route('/user/add/notification/registrationToken')
	.post(setNotificationRegistrationToken);

router.route('/user/request')
	.post(requestUserConnection);

export default router
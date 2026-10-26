import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';
import { verifyAdminOrManager } from '../middlewares/verifyAdminOrManager';
import { verifyAdminManagerOrSelf } from '../middlewares/verifyAdminManagerOrSelf';
import uploadUsersConfig from '../config/uploadUsers';
import multer from 'multer';

const router = Router();
const uploadUser = multer(uploadUsersConfig);

// Listar todos os funcionários (Apenas Admin e Gerente)
router.get('/users', verifyToken, verifyAdminOrManager, UserController.getAllUsers);

// Buscar um funcionário por ID (Admin/Gerente OU o próprio usuário dono da conta)
router.get('/users/:id', verifyToken, verifyAdminManagerOrSelf, UserController.getUserById);

// Cadastrar novo funcionário (Admin e Gerente)
router.post('/users', verifyToken, verifyAdminOrManager,uploadUser.single('image'), UserController.createUser);

// Atualizar funcionário (Admin/Gerente OU o próprio usuário)
router.put('/users/:id', verifyToken, verifyAdminManagerOrSelf, uploadUser.single('image_url'), UserController.updateUser);

// Deletar funcionário (Estritamente Admin)
router.delete('/users/:id', verifyToken, verifyAdmin, UserController.deleteUser);

export default router;
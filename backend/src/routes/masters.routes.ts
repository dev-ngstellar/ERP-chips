import { Router } from 'express';
import { MastersController } from '../controllers/masters.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Raw Materials
router.get('/raw-materials', MastersController.getRawMaterials);
router.post('/raw-materials', MastersController.createRawMaterial);
router.put('/raw-materials/:id', MastersController.updateRawMaterial);

// Products
router.get('/products', MastersController.getProducts);
router.post('/products', MastersController.createProduct);
router.put('/products/:id', MastersController.updateProduct);

// Suppliers
router.get('/suppliers', MastersController.getSuppliers);
router.post('/suppliers', MastersController.createSupplier);
router.put('/suppliers/:id', MastersController.updateSupplier);

// Customers
router.get('/customers', MastersController.getCustomers);
router.post('/customers', MastersController.createCustomer);
router.put('/customers/:id', MastersController.updateCustomer);

export default router;

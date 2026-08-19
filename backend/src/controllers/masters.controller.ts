import { Request, Response, NextFunction } from 'express';
import { MastersService } from '../services/masters.service';
import { sendSuccess } from '../utils/response';

export class MastersController {
  // Raw Materials
  static async getRawMaterials(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.getRawMaterials();
      return sendSuccess(res, data, 'Raw materials retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async createRawMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.createRawMaterial(req.body);
      return sendSuccess(res, data, 'Raw material created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateRawMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.updateRawMaterial(String(req.params.id), req.body);
      return sendSuccess(res, data, 'Raw material updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Products
  static async getProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.getProducts();
      return sendSuccess(res, data, 'Products retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.createProduct(req.body);
      return sendSuccess(res, data, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.updateProduct(String(req.params.id), req.body);
      return sendSuccess(res, data, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Suppliers
  static async getSuppliers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.getSuppliers();
      return sendSuccess(res, data, 'Suppliers retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.createSupplier(req.body);
      return sendSuccess(res, data, 'Supplier created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.updateSupplier(String(req.params.id), req.body);
      return sendSuccess(res, data, 'Supplier updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Customers
  static async getCustomers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.getCustomers();
      return sendSuccess(res, data, 'Customers retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.createCustomer(req.body);
      return sendSuccess(res, data, 'Customer created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MastersService.updateCustomer(String(req.params.id), req.body);
      return sendSuccess(res, data, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

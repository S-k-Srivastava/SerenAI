import { Request, Response, NextFunction } from "express";
import { publicModelConfigsService } from "../services/public.modelconfigs.service.js";

export const getPublicModelConfigs = (
    _req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const configs = publicModelConfigsService.getPublicModelConfigs();
        res.status(200).json({
            success: true,
            data: configs
        });
    } catch (error) {
        next(error);
    }
};

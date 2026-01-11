import { IPublicModelConfigsResponse } from "../../types/index.js";

export interface IPublicModelConfigsService {
    getPublicModelConfigs(): IPublicModelConfigsResponse;
}

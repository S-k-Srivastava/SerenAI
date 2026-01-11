import { Response } from "express";
import { HTTP_STATUS } from "../constants/index.js";

interface IBaseResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = (res: Response, statusCode: number, success: boolean, message: string, data: unknown = null): Response<IBaseResponse<unknown>> => {
  return res.status(statusCode).json({
    data: data,
    error: success ? null : message, // Assuming message is the error if not successful
    status: statusCode,
    message: message,
  });
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = HTTP_STATUS.OK
): Response<IBaseResponse<T>> => {
  return res.status(statusCode).json({
    data,
    error: null,
    status: statusCode,
    message,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): Response<IBaseResponse<T>> => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = "Success"
): Response<IBaseResponse<T[]>> => {
  return res.status(HTTP_STATUS.OK).json({
    data,
    error: null,
    status: HTTP_STATUS.OK,
    message,
    pagination,
  });
};

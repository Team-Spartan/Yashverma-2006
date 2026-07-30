import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiResponse {
  static success(res: Response, message: string, data?: unknown, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, message: string, data?: unknown) {
    return ApiResponse.success(res, message, data, 201);
  }

  static paginated(
    res: Response,
    data: unknown[],
    meta: PaginationMeta,
    message = 'Data retrieved successfully',
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

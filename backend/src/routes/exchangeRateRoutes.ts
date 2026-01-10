/**
 * 환율 API 라우트
 */

import { Router, Request, Response } from 'express';
import { getUSDToKRWRate } from '../services/exchangeRateService';

const router = Router();

/**
 * USD to KRW 환율 조회
 */
router.get('/usd-krw', async (_req: Request, res: Response) => {
  try {
    const rate = await getUSDToKRWRate();
    
    res.json({
      success: true,
      data: {
        rate,
        from: 'USD',
        to: 'KRW',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Exchange rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXCHANGE_RATE_ERROR',
        message: error.message || '환율 조회 중 오류가 발생했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

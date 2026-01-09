/**
 * 주식 관련 API 라우트
 */

import { Router, Request, Response } from 'express';
import { searchStocks, getCurrentPrice, getBatchCurrentPrices } from '../services/stockService';

const router = Router();

/**
 * 종목 검색
 * GET /api/stocks/search?q=삼성&market=KRX
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const market = req.query.market as string | undefined;
    
    if (!query || query.trim().length < 2) {
      res.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const alphaKey = req.query.alphaKey as string | undefined;
    const results = await searchStocks(query.trim(), market, alphaKey);
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : '종목 검색 중 오류가 발생했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 현재가 조회
 * GET /api/stocks/price/:symbol?market=KRX
 */
router.get('/price/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const market = req.query.market as string | undefined;
    
    if (!symbol || symbol.length < 1) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SYMBOL',
          message: '올바른 종목 코드를 입력하세요',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const alphaKey = req.query.alphaKey as string | undefined;
    const stockInfo = await getCurrentPrice(symbol, market, alphaKey);
    
    res.json({
      success: true,
      data: stockInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_ERROR',
        message: error instanceof Error ? error.message : '현재가 조회 중 오류가 발생했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 여러 종목 현재가 일괄 조회
 * POST /api/stocks/batch-price
 * Body: { symbols: ['005930', '000660'] }
 */
router.post('/batch-price', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'symbols 배열을 제공하세요',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (symbols.length > 20) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_SYMBOLS',
          message: '최대 20개까지 조회 가능합니다',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const stockInfos = await getBatchCurrentPrices(symbols);
    
    res.json({
      success: true,
      data: stockInfos,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Batch price error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_PRICE_ERROR',
        message: error instanceof Error ? error.message : '일괄 조회 중 오류가 발생했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

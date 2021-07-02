/*
 * @Description: 二维码相关接口
 * @Creator: ferryvip
 * @Date: 2021-06-21 12:52:46
 */
import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import QRCodeService from '../services/qrcode';
import { Logger } from 'winston';
const route = Router();

export default (app: Router) => {
  app.use('/', route);
  route.get(
    '/qrcode',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const qrCodeService = Container.get(QRCodeService);
        const qrurl = await qrCodeService.qrcode();
        logger.info('🔥 qrurl: %o', qrurl);
        return res.send({ code: 200, data: qrurl });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
  route.get(
    '/status',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const qrCodeService = Container.get(QRCodeService);
        const data = await qrCodeService.status();
        logger.info('🔥 data: %o', data);
        return res.send(data);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};

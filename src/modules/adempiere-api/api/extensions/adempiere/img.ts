/************************************************************************************
 * Copyright (C) 2018-present E.R.P. Consultores y Asociados, C.A.                  *
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com                     *
 * This program is free software: you can redistribute it and/or modify             *
 * it under the terms of the GNU General Public License as published by             *
 * the Free Software Foundation, either version 2 of the License, or                *
 * (at your option) any later version.                                              *
 * This program is distributed in the hope that it will be useful,                  *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                   *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                     *
 * GNU General Public License for more details.                                     *
 * You should have received a copy of the GNU General Public License                *
 * along with this program. If not, see <https://www.gnu.org/licenses/>.            *
 ************************************************************************************/

import { Router } from 'express';
import { ExtensionAPIFunctionParameter } from '@storefront-api/lib/module';

import { downloadImage, fit, identify, resize } from '@storefront-api/lib/image';
import mime from 'mime-types';

const SUPPORTED_ACTIONS = ['fit', 'resize', 'identify'];
const SUPPORTED_MIMETYPES = [
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml'
];

const MINUTES = 5

const CACHE_EXPIRATION = 60 * MINUTES

//  Get Image from gRPC
function getResource (service, resourceName, token) {
  return new Promise((resolve, reject) => {
    if (token != null && !token.startsWith('Bearer')) {
      token = 'Bearer ' + token;
    }
    service.getResource({
      resourceName,
      token
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.buffer);
      }
    })
  });
}

/**
 * Image resizer
 *
 * ```bash
 *  curl https://api.erpya.com/img/310/300/resize/w/p/wp07-black_main.jpg
 * ```
 *
 * or
 *
 * ```bash
 *  curl http://localhost:8080/sample-api/img/600/744/resize/m/p/mp10-black_main.jpg
 * ```
 *
 * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#img
 */
module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('./grpc-api/services/fileManagement');
  const service = new ServiceApi(config);

  /**
   * GET Image
   *
   */
  api.get('/', async (req, res) => {
    if (!(req.method === 'GET')) {
      res.set('Allow', 'GET');
      return res.status(405).send('Method Not Allowed');
    }

    // const modules = config.get('modules');
    const imageable = config.get('imageable') as any;
    // const modules = config.get('modules');

    req.socket.setMaxListeners(imageable.maxListeners || 50);

    let width;
    let height;
    let action;
    let imgUrl;
    let resourceName;
    const token = req.headers.authorization || req.query.token;
    const modules = config.get('modules') as any;

    if (req.query.url) {
      // url provided as the query param
      imgUrl = decodeURIComponent(req.query.url as any);
      width = parseInt(req.query.width as any);
      height = parseInt(req.query.height as any);
      action = req.query.action;
      resourceName = req.query.url;
    } else {
      let urlParts = req.url.split('/');
      width = parseInt(urlParts[1]);
      height = parseInt(urlParts[2]);
      action = urlParts[3];
      resourceName = urlParts[4];

      imgUrl = `${modules.adempiereApi.images.baseUrl}/${urlParts
        .slice(4)
        .join('/')}`; // full original image url
      if (urlParts.length < 4) {
        return res.status(400).send({
          code: 400,
          result:
            'Please provide following parameters: /img/<width>/<height>/<action:fit,resize,identify>/<relative_url>'
        });
      }
    }
    if (isNaN(width) || isNaN(height) || !SUPPORTED_ACTIONS.includes(action)) {
      return res.status(400).send({
        code: 400,
        result:
          'Please provide following parameters: /img/<width>/<height>/<action:fit,resize,identify>/<relative_url> OR ?url=&width=&height=&action='
      });
    }
    if (
      width > imageable.imageSizeLimit ||
      width < 0 ||
      height > imageable.imageSizeLimit ||
      height < 0
    ) {
      return res.status(400).send({
        code: 400,
        result: `Width and height must have a value between 0 and ${imageable.imageSizeLimit}`
      });
    }
    const mimeType = mime.lookup(imgUrl);
    if (mimeType === false || !SUPPORTED_MIMETYPES.includes(mimeType)) {
      return res.status(400).send({
        code: 400,
        result: 'Unsupported file type'
      });
    }
    console.log(
      `[URL]: ${imgUrl} - [ACTION]: ${action} - [WIDTH]: ${width} - [HEIGHT]: ${height}`
    );

    let buffer;
    if (modules.adempiereApi.images.httpBased) {
      try {
        buffer = await downloadImage(imgUrl);
      } catch (err) {
        return res.status(400).send({
          code: 400,
          result: `Unable to download the requested image ${imgUrl}`
        });
      }
    } else {
      try {
        buffer = Buffer.from(await getResource(service, resourceName, token));
      } catch (err) {
        return res.status(400).send({
          code: 400,
          result: `Unable to download the requested image ${imgUrl}`
        });
      }
    }
    //  Process image
    switch (action) {
      case 'resize':
        return res
          .type(mimeType)
          .set({ 'Cache-Control': `max-age=${CACHE_EXPIRATION}` })
          .send(await resize(buffer, width, height));
      case 'fit':
        return res
          .type(mimeType)
          .set({ 'Cache-Control': `max-age=${CACHE_EXPIRATION}` })
          .send(await fit(buffer, width, height));
      case 'identify':
        return res
          .set({ 'Cache-Control': `max-age=${CACHE_EXPIRATION}` })
          .send(await identify(buffer));
      default:
        throw new Error('Unknown action');
    }
  });

  return api;
};

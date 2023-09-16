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

//  Get Resource from gRPC
function getResource ({
  token,
  resourceId,
  resourceUuid,
  resourceName,
  service
}) {
  return new Promise((resolve, reject) => {
    if (token != null && !token.startsWith('Bearer')) {
      token = 'Bearer ' + token;
    }
    service.getResource({
      token,
      resourceId,
      resourceUuid,
      resourceName
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * GET Resource
 */
module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('./grpc-api/services/fileManagement');
  const service = new ServiceApi(config);

  /**
   * GET File
   *
   */
  api.get('/', async (req, res) => {
    if (!(req.method === 'GET')) {
      res.set('Allow', 'GET');
      return res.status(405).send('Method Not Allowed');
    }
    //
    try {
      let buffer = Buffer.from(
        await getResource({
          token: req.headers.authorization || req.query.token,
          resourceId: req.query.resource_id,
          resourceUuid: req.query.resource_uuid,
          resourceName: req.query.resource_name,
          service
        })
      );

      if (buffer && buffer.length > 0) {
        return res.status(200).send({
          code: 200,
          result: buffer
        });
      } else {
        return res.status(400).send({
          code: 400,
          result: 'Unable to download the requested resource'
        });
      }
    } catch (err) {
      return res.status(400).send({
        code: 400,
        result: 'Unable to download the requested resource'
      });
    }
  });

  return api;
};

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

import {
  getCustomerCreditFromGRPC
} from '../pointOfSalesFromGRPC';

module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('../../../../grpc-api/services/pointOfSales');
  const service = new ServiceApi(config)

  /**
   * GET Customer Credit Memo List
   */
 api.get('/list', (req, res) => {
  if (req.query) {
    service.listCustomerCredits({
      token: req.headers.authorization,
      posId: req.query.pos_id,
      customerId: req.query.customer_id,
      searchValue: req.query.search_value,
      // Page Data
      pageSize: req.query.page_size,
      pageToken: req.query.page_token
    }, (err, response) => {
      if (response) {
        res.json({
          code: 200,
          result: {
            record_count: response.getRecordCount(),
            records: response.getRecordsList().map(customerCredit => {
              return getCustomerCreditFromGRPC(customerCredit);
            }),
            next_page_token: response.getNextPageToken()
          }
        });
      } else if (err) {
        res.json({
          code: 500,
          result: err.details
        });
      }
    });
  }
});
  return api;
};

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
import { convertEntitiesListFromGRPC } from '../util/convertData';

module.exports = ({ config }) => {
  let api = Router();
  const ServiceApi = require('../grpc-api/services/businessPartner');
  const service = new ServiceApi(config);

  /**
   * GET List Grid Info
   *
   * req.query.token - user token
   * req.query.process_parameter_uuid - when ius called from process
   * req.query.field_uuid - when ius called from window
   * req.query.browse_field_uuid - when ius called from browser
   * req.query.reference_uuid - when ius called from reference only
   * req.query.column_uuid - when ius called from column uuid
   * req.query.column_name - when ius called from column name only
   * req.query.search_value - search value optional
   * req.query.context_attributes - attributes
   * "context_attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2022-06-13T16:14:23.000Z"
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   */
  api.get('/grid', (req, res) => {
    if (req.query) {
      service.listBusinessPartnerInfo({
        token: req.headers.authorization,
        //  Default Value Query
        fieldUuid: req.query.field_uuid,
        processParameterUuid: req.query.process_parameter_uuid,
        browseFieldUuid: req.query.browse_field_uuid,
        referenceUuid: req.query.reference_uuid,
        columnUuid: req.query.column_uuid,
        columnName: req.query.column_name,
        //  DSL Query
        filters: req.query.filters,
        contextAttributes: req.query.context_attributes,
        searchValue: req.query.search_value,
        //  Page Data
        pageSize: req.query.page_size,
        pageToken: req.query.page_token
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertEntitiesListFromGRPC(response)
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  return api;
};

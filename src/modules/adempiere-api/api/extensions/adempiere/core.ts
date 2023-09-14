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

import { version } from '../../../../../../package.json';

function getSystemInfoFromGRPC (systemInfoToConvert) {
  if (!systemInfoToConvert) {
    return undefined;
  }
  return {
    // adempiere
    name: systemInfoToConvert.getName(),
    release_no: systemInfoToConvert.getReleaseNo(),
    version: systemInfoToConvert.getVersion(),
    last_build_info: systemInfoToConvert.getLastBuildInfo(),
    logo_url: systemInfoToConvert.getLogoUrl(),
    // backend
    backend_date_version: systemInfoToConvert.getBackendDateVersion(),
    backend_main_version: systemInfoToConvert.getBackendMainVersion(),
    backend_implementation_version: systemInfoToConvert.getBackendImplementationVersion(),
    // proxy
    proxy_version: version
  }
}

module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('./grpc-api/services/coreFunctionality');
  const service = new ServiceApi(config);

  /**
   * GET System Info
   *
   */
  api.get('/system-info', (req, res) => {
    service.getSystemInfo((err, response) => {
      if (response) {
        res.json({
          code: 200,
          result: getSystemInfoFromGRPC(response)
        });
      } else if (err) {
        res.json({
          code: 500,
          result: err.details
        });
      }
    });
  });

  return api;
};

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

import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module';
import { StorefrontApiContext } from '@storefront-api/lib/module/types';
import { Router } from 'express';
// import img from './api/extensions/adempiere/img';
// import resource from './api/extensions/adempiere/resource';
import { version } from '../../../package.json';
import path from 'path';

export const ADempiereApi: StorefrontApiModule = new StorefrontApiModule({
  key: 'adempiere-api',
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    const api = Router();
    // const Api = require('./api/extensions/adempiere/grpc-api');
    // const service = new Api(config);

    // Mount the services
    // Image
    // api.use('/img', img({ config, db, service }));
    // api.use('/img/:width/:height/:action/:image', (req, res, next) => {
    //   console.log(req.params);
    // });

    //  Resource
    // api.use('/resource', resource({ config, db, service }));

    // version
    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
      res.json({ version });
    });

    registerExtensions({
      app,
      config,
      db,
      registeredExtensions: config.get('modules.adempiereApi.registeredExtensions'),
      rootPath: path.join(__dirname, 'api', 'extensions')
    });

    // api router
    app.use('/adempiere-api', api);
  }

});

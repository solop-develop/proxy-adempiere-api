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

import path from 'path';
import axios from 'axios';

function convertJobFromDKron (jobToConvert) {
  if (!jobToConvert) {
    return undefined;
  }
  return {
    ...jobToConvert,
    executor_config: undefined
  }
}

function convertExecutionFromDKron (executionToConvert) {
  if (!executionToConvert) {
    return undefined;
  }

  const output = executionToConvert.output;
  const searhValue = '\n';
  const start = executionToConvert.output.lastIndexOf(searhValue);
  let parsedOutput = '{}';
  if (start >= 0) {
    parsedOutput = output.slice(start + searhValue.length, output.length);
  }
  if (parsedOutput === '""') {
    parsedOutput = '{}';
  }

  return {
    ...executionToConvert,
    output: JSON.parse(parsedOutput)
  }
}

export const ADempiereScheduler: StorefrontApiModule = new StorefrontApiModule({
  key: 'adempiere-scheduler',

  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    const api = Router();
    const schedulerHost = config.get('adempiereScheduler.host')

    // version
    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
      res.json({ ...config.get('modules.adempiereScheduler') });
    });

    /**
     * GET List Jobs
     */
    api.get('/v1/jobs', async (req, res, next) => {
      try {
        const response = await axios.get(schedulerHost + '/v1/jobs')
          .then(resp => {
            return resp.data.map(job => {
              return convertJobFromDKron(job);
            });
          });
        res.json(response);
      } catch (err) {
        next(err);
      }
    });

    api.post('/v1/jobs/:id', async (req, res, next) => {
      try {
        const response = await axios.post(
          schedulerHost + req.url,
          req.body
          // {
          //   params: req.params
          // }
        ).then(resp => convertJobFromDKron(resp.data));
        res.json(response);
      } catch (err) {
        next(err);
      }
    });

    api.get('/v1/jobs/:id/executions', async (req, res, next) => {
      try {
        const response = await axios.get(schedulerHost + req.url) // '/v1/jobs/:name/executions')
          .then(resp => {
            return resp.data.map(execution => {
              return convertExecutionFromDKron(execution);
            });
          });
        res.json(response);
      } catch (err) {
        next(err);
      }
    });

    registerExtensions({
      app,
      config,
      db,
      registeredExtensions: config.get('modules.adempiereScheduler.registeredExtensions'),
      rootPath: path.join(__dirname, 'api', 'extensions')
    });

    // api router
    app.use('/scheduler', api);
  }

});

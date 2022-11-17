import { Router } from 'express';
import {
  convertAttachmentFromGRPC,
  convertResourceReferenceFromGRPC
} from '@adempiere/grpc-api/lib/convertBaseDataType';

const multer = require('multer');
const mimeTypes = require('mime-types');

const storage = multer.diskStorage({
  destination: 'attachment/',
  filename: (req, file, callback) => {
    callback(null, file.originalname + '.' + (mimeTypes.extension(file.mimetype)));
  }
})
const upload = multer({
  storage: storage
})

module.exports = ({ config }) => {
  let api = Router();
  const ServiceApi = require('@adempiere/grpc-api')
  let service = new ServiceApi(config)

  /**
   * GET Entity Attachment Information
   *
   * req.query.token - user token
   * req.query.id - id of entity
   * req.query.uuid - uuid of entity
   * req.query.table_name - table name of entity
   * req.query.language - login language
   *
   * Details:https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgeuserorder-history
   */
  api.get('/attachment', (req, res) => {
    if (req.query) {
      service.getAttachment({
        token: req.query.token,
        language: req.query.language,
        tableName: req.query.table_name,
        id: req.query.id,
        uuid: req.query.uuid
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertAttachmentFromGRPC(response)
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

  /**
   * TODO: Add support in the BackEnd and Generate Proto
   */
  api.post('/save-attachment', upload.single('avatar'), (req, res) => {
    console.log(req.avatar)
    res.json({
      code: 200,
      result: 'OK'
    })
  });

  /**
   * GET Resource Reference Information
   *
   * req.query.token - user token
   * req.query.image_id - id of image
   * req.query.language - login language
   *
   * Details:https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgeuserorder-history
   */
  api.get('/resource-reference', (req, res) => {
    if (req.query) {
      service.getResourceReference({
        token: req.query.token,
        language: req.query.language,
        imageId: req.query.image_id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertResourceReferenceFromGRPC(response)
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

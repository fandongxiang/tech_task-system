const joi = require('@hapi/joi')
exports.subabnor = {
  body: {
    zoom:joi.string().alphanum().min(1).max(1).required(),
    puller:joi.number().integer().min(1).max(64).required(),
    sort:joi.string().required(),
    runtime:joi.number().min(0).max(600).required(),
    abnormal:joi.string().required(),
    abCause:joi.string().required(),
    abMeasure:joi.string().required(),
    state:joi.string().required()
  }
}
exports.delabnor = {
  query: {
    id: joi.number().required()
  }
}
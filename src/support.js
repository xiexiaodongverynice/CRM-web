import { cachedModels } from './router_model_cache';
import consoleUtil from './utils/consoleUtil';

export const getReductionModule = (model) => {
  return {
    effects: _.chain(model).result('effects', {}).mapValues(v => 1).value(),
    reducers: _.chain(model).result('reducers', {}).mapValues(v => 1).value(),
  }
};

export const registerModel = (app, model, override) => {
  const addModel = () => {
    app.model(model);
    cachedModels[model.namespace] = getReductionModule(model);
  }
  try{
    if (!cachedModels[model.namespace]) {
      addModel();
    }else if(override && cachedModels[model.namespace]) {
      app.unmodel(model.namespace);
      addModel();
    }
  } catch (e) {
    consoleUtil.error('namespace or model is wrong')
  }
}

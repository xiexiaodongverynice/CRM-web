import { registerModel } from '../support';
import { NewObjectAddModel } from '../models/object_page/object_add_embed';
import { NewObjectAdd } from '../routes/object_page/object_add_embed';
import { NewObjectDetailModel } from '../models/object_page/object_detail_embed';
import { NewObjectDetail } from '../routes/object_page/object_detali_embed';
import { NewObjectEditModel } from '../models/object_page/object_edit_embed';
import { NewObjectEdit } from '../routes/object_page/object_edit_embed';

export const embedObjectAdd = ({
  object_api_name,
  record_type,
  relatedListName,
  parentId,
  parentName,
  parentApiName,
  parentRecord,
  onSave,
}) => {
  const model = NewObjectAddModel({
    object_api_name,
    record_type,
    relatedListName,
    parentId,
    parentName,
    parentApiName,
    parentRecord,
  });
  registerModel(window.fc_getApp(), model, true);
  return NewObjectAdd({
    object_api_name,
    record_type,
    relatedListName,
    parentId,
    parentName,
    onSave,
  })
}

export const embedObjectDetail = ({
  object_api_name,
  record_type,
  id,
  record,
  onSave,
}) => {
  const model = NewObjectDetailModel({
    object_api_name,
    record_type,
    id,
    record,
  });
  registerModel(window.fc_getApp(), model, true);
  return NewObjectDetail({
    object_api_name,
    record_type,
    id,
    onSave,
  })
}

export const embedObjectEdit = ({
  object_api_name,
  record_type,
  id,
  record,
  onSave,
}) => {
  const model = NewObjectEditModel({
    object_api_name,
    record_type,
    id,
    record,
  });
  registerModel(window.fc_getApp(), model, true);
  return NewObjectEdit({
    object_api_name,
    record_type,
    id,
    onSave,
  })
}
import Model from 'flarum/common/Model';
import Tag from 'flarum/tags/models/Tag';

export default class ProtectedTag extends Tag {
  isLockedIconDisplayed() {
    return Model.attribute<boolean>('is_locked_icon_displayed').call(this);
  }
  isPasswordProtected() {
    return Model.attribute<boolean>('is_password_protected').call(this);
  }
  isGroupProtected() {
    return Model.attribute<boolean>('is_group_protected').call(this);
  }
  isUnlocked() {
    return Model.attribute<boolean>('is_unlocked').call(this);
  }
}

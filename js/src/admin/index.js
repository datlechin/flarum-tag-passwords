import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import EditTagModal from 'flarum/tags/components/EditTagModal';
import Stream from 'flarum/utils/Stream';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  app.extensionData
    .for('datlechin-tag-passwords')
    .registerSetting({
        setting: 'flarum-tag-passwords.display_unlock_icon',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_unlock_icon'),
        type: 'switch',
    })
    .registerSetting({
        setting: 'flarum-tag-passwords.display_protected_tag_from_sidebar',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_sidebar'),
        type: 'switch',
    })
    .registerSetting({
        setting: 'flarum-tag-passwords.display_protected_tag_from_tags_page',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_tags_page'),
        type: 'switch',
    });

    
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.group = Model.attribute('group');

  extend(EditTagModal.prototype, 'oninit', function () {
    this.isPasswordProtected = Stream(this.tag.password() || false);
    this.password = Stream(this.tag.password() || '');
    this.isGroupProtected = Stream(this.tag.group() || false);
    this.group = Stream(this.tag.group() || '');
  });

  extend(EditTagModal.prototype, 'fields', function (items) {
    items
      .add(
        'protectedType',
        <div className="Form-group">
          <label>{app.translator.trans('datlechin-tag-passwords.admin.edit_tag.protected_label')}</label>
          <div>
            <label className="checkbox">
              <input type="checkbox" bidi={this.isPasswordProtected} />
              {app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_protected_label')}
            </label>
            <label className="checkbox">
              <input type="checkbox" bidi={this.isGroupProtected} />
              {app.translator.trans('datlechin-tag-passwords.admin.edit_tag.group_protected_label')}
            </label>
            {this.isPasswordProtected() && !this.isGroupProtected() ? (
              <input
                className="FormControl"
                bidi={this.password}
                placeholder={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_placeholder_label')}
              />
            ) : (
              ''
            )}
            {this.isGroupProtected() && !this.isPasswordProtected() ? (
            <input
              className="FormControl"
              bidi={this.group}
              placeholder={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.group_placeholder_label')}
            />
          ) : (
            ''
          )}
          </div>
        </div>
    )
  });

  extend(EditTagModal.prototype, 'submitData', function (data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
    data.group = this.isGroupProtected() ? this.group() : null;
  });
});
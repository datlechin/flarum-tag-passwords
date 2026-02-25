import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import Stream from 'flarum/common/utils/Stream';
import GroupSelector from './components/GroupSelector';

export { default as extend } from './extend';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  extend('ext:flarum/tags/admin/components/EditTagModal', 'oninit', function () {
    this.isPasswordProtected = Stream(this.tag.password() || false);
    this.password = Stream(this.tag.password() || '');
    this.isGroupProtected = Stream(this.tag.protectedGroups() || false);
    this.protectedGroups = this.tag.protectedGroups() ? JSON.parse(this.tag.protectedGroups()) : [];
  });

  extend('ext:flarum/tags/admin/components/EditTagModal', 'fields', function (items) {
    items.add(
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
          ) : null}
          {this.isGroupProtected() && !this.isPasswordProtected() ? <GroupSelector groups={this.protectedGroups} /> : null}
        </div>
      </div>
    );
  });

  extend('ext:flarum/tags/admin/components/EditTagModal', 'submitData', function (data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
    data.protectedGroups = this.isGroupProtected() && this.protectedGroups.length > 0 ? JSON.stringify(this.protectedGroups) : null;
  });
});
